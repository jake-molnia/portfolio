## Abstract

Accurate forecasting of migration flows is critical for humanitarian aid but is challenged by sparse, short-history data. Current methods for selecting exogenous variables rely on subjective domain knowledge or data-driven approaches that fail in small data regimes. We propose a novel method that leverages the internal knowledge of Large Language Models (LLMs) to guide feature selection for time series forecasting. Our approach prompts an LLM to identify the most contextually relevant features from a candidate list, enhanced using Retrieval-Augmented Generation (RAG) to incorporate up-to-date, domain-specific knowledge. We evaluate on European migration data (FRONTEX, 2019–2024) and standard forecasting benchmarks. Results show that LLM-guided feature selection consistently improves forecast accuracy over models using the full feature set and outperforms traditional data-driven techniques in data-scarce scenarios.

---

## 1. Introduction

Forecasting migration flows is a critical yet formidable challenge, essential for effective humanitarian resource allocation in response to escalating global displacement. During crises such as the 2015–2016 European migration crisis, the failure of early warning systems highlighted the urgent need for reliable forecasts to guide timely aid.

Incorporating exogenous factors into time series models helps by providing indirect information that influences human movement. These are collectively referred to as **push-pull factors** — push factors motivate individuals to leave their home country (e.g., poverty, agricultural collapse), while pull factors attract them to a destination (e.g., job prospects, government stability).

Recent ML models using small numbers of push-pull factors have achieved slight improvements over classical statistical models. However, results are not generalizable: the set of relevant factors differs across regions, and current feature selection remains highly dependent on domain knowledge and prone to human biases.

While including large numbers of potential factors would seem desirable, sparse data collection combined with short migration data histories makes training effective models difficult. As shown below, providing too many features causes severe overfitting across all model types.

| Route | Prophet (None) | Prophet (All) | SARIMAX (None) | SARIMAX (All) | TimeXer (None) | TimeXer (All) |
|---|---|---|---|---|---|---|
| C. Mediterranean | 27.2 | 98.0 | 54.6 | 73.6 | 44.8 | 53.2 |
| E. Borders | 67.7 | 1050.5 | 726.4 | — | 71.6 | 74.9 |
| E. Mediterranean | 89.8 | 387.1 | 75.1 | no conv. | 117.8 | 315.5 |
| W. Mediterranean | 36.2 | 36.2 | 38.3 | 36.2 | 36.9 | 35.9 |

*MAPE for $n=0$ (None) vs $n=157$ (All) features. Using all features causes severe overfitting.*

To select relevant features while avoiding human biases, we turn to **LLMs** and **RAG**, which demonstrate strong capability to capture contextual relationships and encode general knowledge across domains.

**Research questions:**

- **RQ1** — How well do current feature selection techniques work in small data regimes?
- **RQ2** — Can LLMs be used for feature selection, and how do they compare with existing techniques?
- **RQ3** — Does the choice of LLM impact the quality of selected features?
- **RQ4** — Can RAG further improve LLM-guided feature selection?

---

## 2. Related Work

### LLMs for Time Series Prediction

Most approaches preserve LLM architecture and weights while modifying input format to match LLM expectations. Prominent approaches range from encoding time series as digit strings for next-token prediction to segmenting into patches passed to transformer encoders. **LLM4TS** incorporates instance normalization and channel independence before patching. **Time-LLM** introduces *patch reprogramming*, utilizing both word and patch embeddings through multi-head cross-attention. **GPT4TS** experiments with freezing attention while fine-tuning only input and positional embeddings.

None of the current techniques leverages the LLM's internal knowledge about the *semantics* of time series variables for prediction — the gap our work addresses.

### Time Series Foundation Models

**TimeXer** is the first transformer architecture explicitly designed for exogenous variable integration, introducing a dual-attention mechanism with patch-wise self-attention for endogenous variables and variate-wise cross-attention for exogenous interactions. **Moirai** handles arbitrary variates via flattened sequences trained on 27 billion observations. IBM's **TTM** challenges transformer dominance using MLP-based mixing, achieving competitive performance with $< 1\text{M}$ parameters. Recent work on CITRAS and ExoTST demonstrates up to $10\%$ accuracy improvements through proper temporal alignment of exogenous variables.

### LLMs for Feature Selection

**LMPriors** pioneered LLM-based feature selection by prompting GPT-3 to score feature importance via log-probability differences. **LLM-select** extended this with three text-only pipelines. **ICE-SEARCH** iteratively optimizes selection using externally computed test scores. **LLM-Lasso** converts LLM-generated penalty factors into Lasso weights. **LLM4FS** integrates LLM contextual knowledge with random forest and forward sequential selection.

These works illustrate the potential of LLMs to encode relevant contextual information to augment supervised learning. The present study is the first to explore this in the context of **time series forecasting**.

---

## 3. Proposed Method

We propose **TSFS-LLM** (*Time Series Feature Selection via LLM*), designed specifically for small data regimes.

Given a candidate feature list $\mathcal{F} = \{f_1, f_2, \ldots, f_m\}$ and a forecasting task description $\mathcal{T}$, we prompt an LLM to select a subset $\mathcal{S} \subseteq \mathcal{F}$ of size $k$:

$$\mathcal{S}^* = \text{LLM}_\theta\!\left(\mathcal{T},\, \mathcal{F},\, k,\, \mathcal{D}_\text{RAG}\right)$$

where $\mathcal{D}_\text{RAG}$ is an optional set of retrieved documents injected via RAG to provide domain context. The selected features $\mathcal{S}^*$ are then used with any downstream forecasting model:

$$\hat{y} = f_\phi\!\left(y_{1:t},\, \mathcal{S}^*_{1:t}\right)$$

### RAG Integration

For the migration flow case study, we construct a retrieval corpus from Wikipedia articles and domain reports related to EU migration routes. At inference time, the top-$r$ most relevant documents are retrieved via dense passage retrieval and prepended to the LLM prompt:

$$\mathcal{D}_\text{RAG} = \text{Retrieve}(q_\mathcal{T},\, \mathcal{C},\, r)$$

This allows the model to incorporate recent geopolitical context not present in the LLM's pre-training data.

---

## 4. Experiments

We evaluate on two settings:

- **Benchmark datasets** — standard forecasting benchmarks to characterize general performance
- **FRONTEX migration data** — European migration flows (2019–2024) across five routes

We test all combinations of:

- **LLMs**: Gemini-2.5, GPT-4o-mini
- **Forecasting models**: SARIMAX, Prophet, TimeXer, iTransformer
- **Feature counts**: $k \in \{5, 10, 20, 50\}$

Baselines include full feature set, random selection, mutual information, and LASSO.

---

## 5. Conclusion

We introduced TSFS-LLM for LLM-guided feature selection in time series forecasting under small data constraints. Key findings:

- Using all available features causes severe overfitting regardless of model type
- LLM-guided selection consistently outperforms traditional data-driven methods in low-data scenarios
- RAG integration improves selection quality by providing current domain context
- Larger LLMs generally select more relevant feature subsets

This work demonstrates the potential of LLMs as knowledge-driven feature selectors in data-scarce domains, opening avenues for broader application in humanitarian forecasting, epidemiology, and other fields where data availability is a fundamental constraint.