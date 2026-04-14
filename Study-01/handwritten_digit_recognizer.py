"""
Handwritten Digit Recognizer
=============================
Draws a digit on a tkinter canvas, then classifies it using a
Multi-Layer Perceptron trained on the MNIST dataset via scikit-learn.

Dependencies: numpy, pillow, scikit-learn (all standard; no deep-learning
framework required).
"""

import io
import os
import pickle
import tkinter as tk
from tkinter import font as tkfont

import numpy as np
from PIL import Image, ImageOps
from sklearn.datasets import fetch_openml
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
CANVAS_SIZE   = 280          # on-screen canvas (pixels)
MODEL_SIZE    = 28           # MNIST input size (pixels)
BRUSH_RADIUS  = 12           # drawing brush half-width
MODEL_PATH    = "mnist_mlp_model.pkl"
SCALER_PATH   = "mnist_scaler.pkl"
TRAIN_SAMPLES = 60_000       # use all training samples for best accuracy
HIDDEN_LAYERS = (256, 128)   # MLP hidden layer sizes


# ---------------------------------------------------------------------------
# Model helpers
# ---------------------------------------------------------------------------

def train_and_save_model() -> tuple[MLPClassifier, StandardScaler]:
    """Download MNIST, train an MLP, and persist the model to disk."""
    print("Downloading MNIST dataset (first run only, ~55 MB)...")
    mnist = fetch_openml("mnist_784", version=1, as_frame=False, parser="auto")
    X, y = mnist.data, mnist.target.astype(int)

    # Use up to TRAIN_SAMPLES examples
    n = min(TRAIN_SAMPLES, len(X))
    X_train, y_train = X[:n], y[:n]

    print(f"Scaling {n} training samples...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)

    print("Training MLP classifier (this may take a minute)...")
    clf = MLPClassifier(
        hidden_layer_sizes=HIDDEN_LAYERS,
        activation="relu",
        solver="adam",
        max_iter=30,
        random_state=42,
        verbose=True,
    )
    clf.fit(X_train_scaled, y_train)

    # Quick validation on the last 10 000 samples
    X_test_scaled = scaler.transform(X[n : n + 10_000])
    y_test = y[n : n + 10_000]
    if len(y_test) > 0:
        accuracy = clf.score(X_test_scaled, y_test)
        print(f"Validation accuracy: {accuracy * 100:.2f}%")

    # Persist to disk so we skip training on subsequent runs
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(clf, f)
    with open(SCALER_PATH, "wb") as f:
        pickle.dump(scaler, f)
    print("Model saved.")
    return clf, scaler


def load_or_train_model() -> tuple[MLPClassifier, StandardScaler]:
    """Return a (model, scaler) pair – loads from disk when available."""
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        print("Loading pre-trained model from disk...")
        with open(MODEL_PATH, "rb") as f:
            clf = pickle.load(f)
        with open(SCALER_PATH, "rb") as f:
            scaler = pickle.load(f)
        print("Model loaded successfully.")
        return clf, scaler
    return train_and_save_model()


# ---------------------------------------------------------------------------
# Image preprocessing
# ---------------------------------------------------------------------------

def canvas_to_mnist_array(canvas: tk.Canvas) -> np.ndarray:
    """
    Capture the canvas content and convert it to a normalised 1×784 array
    that matches the MNIST input format (white digit on black background,
    28×28 pixels, values in [0, 1]).
    """
    # Render the canvas to a PIL image via PostScript
    ps = canvas.postscript(colormode="color")
    img = Image.open(io.BytesIO(ps.encode("utf-8")))

    # Resize to MNIST dimensions and convert to grayscale
    img = img.resize((MODEL_SIZE, MODEL_SIZE), Image.LANCZOS).convert("L")

    # The canvas has a white background with black strokes;
    # MNIST has black background with white strokes → invert
    img = ImageOps.invert(img)

    arr = np.array(img, dtype=np.float32).flatten()
    return arr.reshape(1, -1)          # shape (1, 784)


# ---------------------------------------------------------------------------
# GUI
# ---------------------------------------------------------------------------

class DigitRecognizerApp(tk.Tk):
    """Main application window with drawing canvas and prediction display."""

    def __init__(self, clf: MLPClassifier, scaler: StandardScaler) -> None:
        super().__init__()
        self.clf    = clf
        self.scaler = scaler

        self.title("Handwritten Digit Recognizer")
        self.resizable(False, False)
        self._build_ui()
        self._last_x: int | None = None
        self._last_y: int | None = None

    # ------------------------------------------------------------------ UI

    def _build_ui(self) -> None:
        header_font  = tkfont.Font(family="Helvetica", size=13, weight="bold")
        result_font  = tkfont.Font(family="Helvetica", size=48, weight="bold")
        prob_font    = tkfont.Font(family="Helvetica", size=10)
        button_font  = tkfont.Font(family="Helvetica", size=11)

        # ── Title ──────────────────────────────────────────────────────────
        tk.Label(self, text="Draw a digit (0–9) and click Predict",
                 font=header_font, pady=8).pack()

        # ── Main frame ────────────────────────────────────────────────────
        main = tk.Frame(self)
        main.pack(padx=10, pady=4)

        # Drawing canvas (left)
        canvas_frame = tk.LabelFrame(main, text="Canvas", padx=4, pady=4)
        canvas_frame.grid(row=0, column=0, padx=(0, 12))

        self.canvas = tk.Canvas(
            canvas_frame,
            width=CANVAS_SIZE, height=CANVAS_SIZE,
            bg="white", cursor="crosshair",
        )
        self.canvas.pack()
        self.canvas.bind("<B1-Motion>",       self._on_draw)
        self.canvas.bind("<ButtonRelease-1>", self._on_release)

        # Result panel (right)
        result_frame = tk.LabelFrame(main, text="Prediction", padx=12, pady=8)
        result_frame.grid(row=0, column=1, sticky="nsew")

        # Large digit display
        self.result_label = tk.Label(
            result_frame, text="?",
            font=result_font, width=3,
            fg="#2563EB",          # blue
        )
        self.result_label.pack()

        tk.Label(result_frame, text="Confidence", font=prob_font).pack(pady=(8, 2))

        # Probability bar chart (10 classes)
        self.bar_canvas = tk.Canvas(result_frame, width=160, height=160, bg="white")
        self.bar_canvas.pack()

        # ── Buttons ────────────────────────────────────────────────────────
        btn_frame = tk.Frame(self)
        btn_frame.pack(pady=8)

        tk.Button(
            btn_frame, text="Predict", font=button_font,
            bg="#2563EB", fg="white", padx=16, pady=6,
            command=self._predict,
        ).grid(row=0, column=0, padx=6)

        tk.Button(
            btn_frame, text="Clear", font=button_font,
            bg="#DC2626", fg="white", padx=16, pady=6,
            command=self._clear,
        ).grid(row=0, column=1, padx=6)

    # ---------------------------------------------------------------- Draw

    def _on_draw(self, event: tk.Event) -> None:
        """Paint a circle at the current cursor position."""
        x, y = event.x, event.y
        r = BRUSH_RADIUS
        self.canvas.create_oval(x - r, y - r, x + r, y + r,
                                fill="black", outline="black")
        self._last_x, self._last_y = x, y

    def _on_release(self, _event: tk.Event) -> None:
        self._last_x = self._last_y = None

    def _clear(self) -> None:
        """Erase the canvas and reset the prediction panel."""
        self.canvas.delete("all")
        self.result_label.config(text="?", fg="#2563EB")
        self.bar_canvas.delete("all")

    # -------------------------------------------------------------- Predict

    def _predict(self) -> None:
        """Run inference and update the result panel."""
        # --- capture canvas as a PIL Image --------------------------------
        # PostScript rendering is not always available on all platforms,
        # so we use ImageGrab as a fallback.
        try:
            img = self._canvas_to_pil_via_postscript()
        except Exception:
            img = self._canvas_to_pil_via_grab()

        if img is None:
            self.result_label.config(text="ERR", fg="#DC2626")
            return

        # --- preprocess ---------------------------------------------------
        img = img.resize((MODEL_SIZE, MODEL_SIZE), Image.LANCZOS).convert("L")
        img = ImageOps.invert(img)          # white-on-black → black-on-white

        arr = np.array(img, dtype=np.float32).flatten().reshape(1, -1)
        arr_scaled = self.scaler.transform(arr)

        # --- inference ----------------------------------------------------
        digit      = int(self.clf.predict(arr_scaled)[0])
        proba      = self.clf.predict_proba(arr_scaled)[0]   # shape (10,)
        confidence = proba[digit] * 100

        # --- update UI ----------------------------------------------------
        color = "#16A34A" if confidence >= 70 else "#D97706"   # green / amber
        self.result_label.config(
            text=f"{digit}",
            fg=color,
        )
        self._draw_probability_bars(proba)
        self.title(f"Prediction: {digit}  ({confidence:.1f}%)")

    def _draw_probability_bars(self, proba: np.ndarray) -> None:
        """Render a small bar chart of class probabilities (0–9)."""
        bc   = self.bar_canvas
        bc.delete("all")
        W, H = 160, 160
        bar_w = W // 10
        max_p = max(proba) if max(proba) > 0 else 1.0

        for i, p in enumerate(proba):
            bar_h = int((p / max_p) * (H - 20))
            x0    = i * bar_w + 2
            x1    = x0 + bar_w - 4
            y1    = H - 16
            y0    = y1 - bar_h

            fill = "#2563EB" if i == int(np.argmax(proba)) else "#93C5FD"
            bc.create_rectangle(x0, y0, x1, y1, fill=fill, outline="")
            # digit label below bar
            bc.create_text(
                (x0 + x1) // 2, H - 6,
                text=str(i), font=("Helvetica", 8),
            )

    # --------------------------------------------------- Image capture helpers

    def _canvas_to_pil_via_postscript(self) -> Image.Image:
        """Convert canvas to PIL Image using EPS PostScript (preferred)."""
        ps  = self.canvas.postscript(colormode="gray")
        img = Image.open(io.BytesIO(ps.encode("utf-8")))
        return img.convert("RGB")

    def _canvas_to_pil_via_grab(self) -> Image.Image | None:
        """
        Fallback: screen-grab the canvas widget.
        Requires the canvas to be fully on-screen.
        """
        try:
            from PIL import ImageGrab
            self.update_idletasks()
            x = self.canvas.winfo_rootx()
            y = self.canvas.winfo_rooty()
            w = x + self.canvas.winfo_width()
            h = y + self.canvas.winfo_height()
            return ImageGrab.grab(bbox=(x, y, w, h))
        except Exception as exc:
            print(f"Screen grab failed: {exc}")
            return None


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    # Load (or train) the model in the main thread so the window opens only
    # after the model is ready.
    clf, scaler = load_or_train_model()

    app = DigitRecognizerApp(clf, scaler)
    app.mainloop()


if __name__ == "__main__":
    main()
