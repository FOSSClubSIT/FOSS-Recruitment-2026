# FOSS Readme Classifier

Two lightweight text classifiers that predict a GitHub repository's **category**
(CLI Tool / Web Dev / Machine Learning / Mobile Dev) and its **license family**
(Permissive / Copyleft / Unknown) directly from its one-line description. The
goal was to see how much a project's description alone reveals about metadata
it never explicitly states.

Data is pulled live from the GitHub Search API (public repo descriptions +
license info), turned into TF-IDF features, and fed into two independent
`scikit-learn` `LogisticRegression` pipelines.

## How to run

```bash
cd trisha_mahajan
pip install -r requirements.txt

python fetch-data.py      # builds data/dataset.csv from GitHub
python train.py           # trains the category model  -> models/category_model.pkl
python train_license.py   # trains the license model    -> models/license_model.pkl

python predict.py "A fast CLI tool for managing dotfiles across machines"
```

## What I found hard / would do differently

- **Path bugs bit me early.** My first version hardcoded relative paths
  (`"data/dataset.csv"`) that only worked if the script happened to be run
  from one specific directory. I fixed this by anchoring every path to the
  script's own location (`os.path.dirname(os.path.abspath(__file__))`), so it
  works regardless of where you `cd` from.
- **If I had more time**, I would expand the Copyleft-targeted queries further and
  try using repo topics or fuller README text (not just the one-line
  description) as additional features, the description alone is a fairly
  thin signal for predicting license.