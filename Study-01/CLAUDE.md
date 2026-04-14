# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-file tkinter app that lets the user draw a digit on a canvas and classifies it with a scikit-learn MLP trained on MNIST. No deep-learning framework is used.

**Dependencies:** Python 3.13, numpy, pillow, scikit-learn (no TensorFlow/PyTorch).

## Running

```bash
# Run the app (trains model on first run, loads from disk afterwards)
python handwritten_digit_recognizer.py

# Rebuild the Windows executable after code changes
python -m PyInstaller --onefile --windowed --name "HandwrittenDigitRecognizer" handwritten_digit_recognizer.py
# Then copy model files next to the exe:
cp mnist_mlp_model.pkl mnist_scaler.pkl dist/
```

## Architecture

Everything lives in `handwritten_digit_recognizer.py`:

| Layer | What it does |
|---|---|
| **Model layer** (`train_and_save_model`, `load_or_train_model`) | Downloads MNIST via `fetch_openml`, fits `MLPClassifier(256→128)` + `StandardScaler`, pickles both to `mnist_mlp_model.pkl` / `mnist_scaler.pkl` |
| **Preprocessing** (`_predict` internals) | Canvas → EPS PostScript → PIL Image → resize 28×28 → grayscale → invert (white-on-black to match MNIST) → flatten to 1×784 → scale |
| **GUI** (`DigitRecognizerApp(tk.Tk)`) | Left: 280×280 drawing canvas. Right: predicted digit label + 10-bar probability chart. Buttons: Predict, Clear |
| **Image capture** | Primary path: `canvas.postscript()` → PIL. Fallback: `PIL.ImageGrab` screen capture (used when Ghostscript is unavailable) |

## Key constants (top of file)

- `CANVAS_SIZE = 280` — on-screen drawing area
- `MODEL_SIZE = 28` — MNIST input resolution
- `BRUSH_RADIUS = 12` — drawing brush size; increase for thicker strokes
- `HIDDEN_LAYERS = (256, 128)` — MLP architecture
- `TRAIN_SAMPLES = 60_000` — reduce to speed up retraining during experimentation

## Persisted files

`mnist_mlp_model.pkl` and `mnist_scaler.pkl` are written next to the script (CWD at runtime). Delete them to force retraining. The `dist/` exe also needs these two files in the same directory.