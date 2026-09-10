import re
import math
from collections import Counter

FUNCTION_WORDS = [
    "the", "and", "of", "to", "a", "in", "that", "is", "for", "with",
    "as", "it", "on", "we", "you", "are", "be", "this", "from", "or",
    "have", "by", "not", "but", "at", "all", "they", "our", "an", "will",
    "if", "can", "so", "no", "when", "your", "my", "more", "up", "out",
    "about", "what", "which", "their", "there", "would", "do", "one", "some",
    "time", "just", "now", "like", "other", "than", "then", "into", "could",
    "first", "only", "its", "over", "also", "after", "how", "well", "way",
    "even", "new", "must", "any", "these", "should", "because", "each", "where",
    "both", "very", "between", "while", "never", "same", "another", "might",
    "under", "since", "against", "without", "before"
]

PUNCTUATION_MARKS = [",", ".", "!", "?", ":", ";", "-", '"', "'", "(", ")", "..."]

def tokenize(text: str) -> list[str]:
    return re.findall(r"\b[a-zA-Z0-9_']+\b", text.lower())

def split_sentences(text: str) -> list[str]:
    sentences = re.split(r"[.!?]+", text)
    return [s.strip() for s in sentences if s.strip()]

def compute_yules_k(tokens: list[str]) -> float:
    """Computes Yule's Characteristic K for vocabulary richness (length-invariant)."""
    n = len(tokens)
    if n == 0:
        return 0.0
    freqs = Counter(tokens)
    m1 = n
    m2 = sum(f * f for f in freqs.values())
    if m1 <= 1:
        return 0.0
    k = 10000.0 * (m2 - m1) / (m1 * m1)
    return round(k, 2)

def compute_simpsons_d(tokens: list[str]) -> float:
    """Computes Simpson's Diversity Index."""
    n = len(tokens)
    if n <= 1:
        return 0.0
    freqs = Counter(tokens)
    d = sum(f * (f - 1) for f in freqs.values()) / (n * (n - 1))
    return round(d, 4)

def extract_features(text: str) -> dict:
    tokens = tokenize(text)
    sentences = split_sentences(text)
    total_words = len(tokens)
    unique_words = len(set(tokens))
    
    # Sentence lengths
    sentence_lengths = [len(tokenize(s)) for s in sentences] if sentences else [0]
    avg_sentence_len = round(sum(sentence_lengths) / max(len(sentence_lengths), 1), 2)
    
    # Average word length
    avg_word_len = round(sum(len(t) for t in tokens) / max(total_words, 1), 2)
    
    # Function words frequency per 1,000 words
    fw_vector = []
    token_counts = Counter(tokens)
    for fw in FUNCTION_WORDS:
        rate = (token_counts.get(fw, 0) / max(total_words, 1)) * 1000.0
        fw_vector.append(rate)
        
    # Punctuation rate per 1,000 characters
    char_len = max(len(text), 1)
    punct_vector = []
    for p in PUNCTUATION_MARKS:
        if p == "...":
            c = text.count("...")
        else:
            c = text.count(p)
        punct_vector.append((c / char_len) * 1000.0)

    ttr = round(unique_words / max(total_words, 1), 3)
    yules_k = compute_yules_k(tokens)
    simpsons_d = compute_simpsons_d(tokens)

    return {
        "wordCount": total_words,
        "uniqueWords": unique_words,
        "typeTokenRatio": ttr,
        "avgWordLength": avg_word_len,
        "sentenceCount": len(sentences),
        "avgSentenceLength": avg_sentence_len,
        "yulesK": yules_k,
        "simpsonsD": simpsons_d,
        "fwVector": fw_vector,
        "punctVector": punct_vector,
    }

def cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
    dot = sum(a * b for a, b in zip(vec1, vec2))
    mag1 = math.sqrt(sum(a * a for a, b in zip(vec1, vec2)))
    mag2 = math.sqrt(sum(b * b for a, b in zip(vec1, vec2)))
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return max(0.0, min(1.0, dot / (mag1 * mag2)))

def compare_stylometry(text_a: str, text_b: str, handle_a: str = "Author A", handle_b: str = "Author B") -> dict:
    feat_a = extract_features(text_a)
    feat_b = extract_features(text_b)

    fw_sim = cosine_similarity(feat_a["fwVector"], feat_b["fwVector"])
    punct_sim = cosine_similarity(feat_a["punctVector"], feat_b["punctVector"])

    # Yule's K distance
    k_diff = abs(feat_a["yulesK"] - feat_b["yulesK"])
    k_sim = max(0.0, 1.0 - (k_diff / 80.0))

    # Sentence length similarity
    sent_diff = abs(feat_a["avgSentenceLength"] - feat_b["avgSentenceLength"])
    sent_sim = max(0.0, 1.0 - (sent_diff / 25.0))

    # Weighted composite score
    overall_sim = (fw_sim * 0.45) + (punct_sim * 0.25) + (k_sim * 0.15) + (sent_sim * 0.15)
    overall_pct = round(overall_sim * 100.0, 1)

    if overall_pct >= 85:
        verdict = "SAME_AUTHOR_HIGH_CONFIDENCE"
        confidence = "HIGH CONFIDENCE (PROBABLE SAME AUTHOR)"
    elif overall_pct >= 70:
        verdict = "LIKELY_SAME_AUTHOR"
        confidence = "MODERATE CONFIDENCE (EVIDENTIARY AFFINITY)"
    else:
        verdict = "DISTINCT_AUTHORS"
        confidence = "INCONCLUSIVE / DISTINCT WRITING PATTERN"

    metrics_list = [
        {
            "metric": "Function-Word Distribution (Cosine)",
            "valueA": f"{round(fw_sim * 100.0, 1)}%",
            "valueB": "Vector baseline",
            "matchScore": int(round(fw_sim * 100.0)),
            "significance": "HIGH",
        },
        {
            "metric": "Vocabulary Richness (Yule's K)",
            "valueA": f"K={feat_a['yulesK']}",
            "valueB": f"K={feat_b['yulesK']}",
            "matchScore": int(round(k_sim * 100.0)),
            "significance": "HIGH",
        },
        {
            "metric": "Punctuation Signature (Cosine)",
            "valueA": f"{round(punct_sim * 100.0, 1)}%",
            "valueB": "Cadence match",
            "matchScore": int(round(punct_sim * 100.0)),
            "significance": "HIGH",
        },
        {
            "metric": "Average Sentence Length",
            "valueA": f"{feat_a['avgSentenceLength']} words",
            "valueB": f"{feat_b['avgSentenceLength']} words",
            "matchScore": int(round(sent_sim * 100.0)),
            "significance": "MEDIUM",
        },
        {
            "metric": "Type-Token Ratio (TTR)",
            "valueA": f"{feat_a['typeTokenRatio']}",
            "valueB": f"{feat_b['typeTokenRatio']}",
            "matchScore": int(round(max(0.0, 1.0 - abs(feat_a['typeTokenRatio'] - feat_b['typeTokenRatio'])) * 100.0)),
            "significance": "MEDIUM",
        },
        {
            "metric": "Simpson's Diversity Index",
            "valueA": f"D={feat_a['simpsonsD']}",
            "valueB": f"D={feat_b['simpsonsD']}",
            "matchScore": int(round(max(0.0, 1.0 - abs(feat_a['simpsonsD'] - feat_b['simpsonsD']) * 10) * 100.0)),
            "significance": "MEDIUM",
        },
    ]

    key_correlations = []
    if fw_sim > 0.75:
        key_correlations.append("High concordance in subconscious function word selection (conjunctions & relative pronouns)")
    if abs(feat_a["avgWordLength"] - feat_b["avgWordLength"]) < 0.4:
        key_correlations.append("Identical lexical syllable complexity and average word length")
    if k_sim > 0.7:
        key_correlations.append("Closely correlated vocabulary diversity and Yule's characteristic curve")
    if not key_correlations:
        key_correlations.append("Grammatical structure and lexical density reflect independent operator styles")

    dissimilarities = [
        f"Variance in sentence length ({feat_a['avgSentenceLength']} vs {feat_b['avgSentenceLength']} words/sentence)"
        if feat_a["avgSentenceLength"] != feat_b["avgSentenceLength"] else "Minor stylistic variance in sentence cadence",
        "Punctuation distribution shifts between independent marketplace announcements"
    ]

    return {
        "handleA": handle_a,
        "handleB": handle_b,
        "overallSimilarity": overall_pct,
        "classicalStylometrySimilarity": overall_pct,
        "verdict": verdict,
        "confidenceRating": confidence,
        "metricsComparison": metrics_list,
        "keyCorrelations": key_correlations,
        "dissimilarities": dissimilarities,
        "detailedFeatures": {
            "featuresA": feat_a,
            "featuresB": feat_b,
        }
    }
