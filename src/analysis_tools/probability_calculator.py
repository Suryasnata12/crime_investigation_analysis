import numpy as np
from collections import defaultdict

def calculate_suspect_probabilities(suspect_data, prior_prob=0.5):
    """
    Calculate probability scores for suspects based on evidence links.
    
    Args:
        suspect_data (list): List of dictionaries containing suspect information and evidence links
        prior_prob (float): Prior probability for all suspects (0-1)
        
    Returns:
        list: List of probability assessment dictionaries
    """
    probabilities = []
    
    # Process each suspect
    for suspect in suspect_data:
        # Skip if no evidence links
        if not suspect.get('evidence_links'):
            continue
        
        # Get all evidence links
        evidence_links = suspect['evidence_links']
        
        # Calculate basic probability using Bayesian approach
        probability = calculate_bayesian_probability(evidence_links, prior_prob)
        
        # Calculate confidence interval
        confidence_interval = calculate_confidence_interval(probability, len(evidence_links))
        
        # Create supporting and conflicting evidence lists
        supporting_links = [link for link in evidence_links 
                            if link.get('match_status') in ['match', 'partial_match']]
        conflicting_links = [link for link in evidence_links 
                             if link.get('match_status') in ['no_match', 'inconclusive']]
        
        # Extract evidence IDs
        supporting_evidence_ids = [str(link['evidence_id']) for link in supporting_links]
        conflicting_evidence_ids = [str(link['evidence_id']) for link in conflicting_links]
        
        # Identify key factors for probability
        factors = identify_key_factors(evidence_links, probability)
        
        # Create hypothesis based on probability
        hypothesis = generate_hypothesis(suspect['name'], probability)
        
        # Create probability assessment
        assessment = {
            'suspect_id': suspect['id'],
            'suspect_name': suspect['name'],
            'hypothesis': hypothesis,
            'probability_score': round(probability, 3),
            'confidence_interval': confidence_interval,
            'assessment_method': 'Bayesian evidence analysis',
            'factors_considered': factors,
            'supporting_evidence_ids': ','.join(supporting_evidence_ids),
            'conflicting_evidence_ids': ','.join(conflicting_evidence_ids),
            'evidence_count': len(evidence_links),
            'supporting_count': len(supporting_links),
            'conflicting_count': len(conflicting_links)
        }
        
        probabilities.append(assessment)
    
    # Sort by probability score descending
    probabilities.sort(key=lambda x: x['probability_score'], reverse=True)
    
    return probabilities

def calculate_bayesian_probability(evidence_links, prior_prob=0.5):
    """
    Calculate probability using Bayesian approach with evidence weights.
    
    Returns:
        float: Probability value (0-1)
    """
    # Start with prior probability
    p = prior_prob
    
    # Evidence weights by match status
    match_weights = {
        'match': 0.8,
        'partial_match': 0.4,
        'possible_match': 0.2,
        'no_match': -0.6,
        'inconclusive': 0.0
    }
    
    # Evidence weights by reliability
    reliability_weights = {
        'high': 1.0,
        'medium': 0.7,
        'low': 0.4,
        'unknown': 0.2
    }
    
    # Calculate likelihood ratio for each piece of evidence
    for link in evidence_links:
        match_status = link.get('match_status', 'inconclusive')
        reliability = link.get('reliability', 'unknown')
        
        # Get base weight from match status
        if match_status in match_weights:
            weight = match_weights[match_status]
        else:
            weight = 0.0
            
        # Adjust by reliability
        if reliability in reliability_weights:
            weight *= reliability_weights[reliability]
            
        # Apply confidence adjustment if available
        if 'confidence' in link and link['confidence'] is not None:
            weight *= link['confidence']
            
        # Skip if weight is zero (no impact)
        if weight == 0:
            continue
            
        # Convert weight to likelihood ratio
        if weight > 0:
            # Supporting evidence: increases probability
            lr = 1 + weight
        else:
            # Conflicting evidence: decreases probability
            lr = 1 / (1 - weight)
            
        # Update probability using Bayes' rule
        p = (p * lr) / (p * lr + (1-p))
    
    return p

def calculate_confidence_interval(probability, evidence_count):
    """
    Calculate a simple confidence interval for the probability.
    
    Returns:
        str: Confidence interval as string, e.g. "0.65-0.85"
    """
    # Base uncertainty based on evidence count
    if evidence_count <= 1:
        margin = 0.3
    elif evidence_count <= 3:
        margin = 0.2
    elif evidence_count <= 6:
        margin = 0.15
    elif evidence_count <= 10:
        margin = 0.1
    else:
        margin = 0.05
        
    # Calculate interval bounds
    lower = max(0.0, probability - margin)
    upper = min(1.0, probability + margin)
    
    # Return as formatted string
    return f"{lower:.2f}-{upper:.2f}"

def identify_key_factors(evidence_links, probability):
    """
    Identify key factors that influenced the probability assessment.
    
    Returns:
        str: Description of key factors
    """
    factors = []
    
    # Count evidence by type and match status
    type_counts = defaultdict(int)
    match_counts = defaultdict(int)
    
    for link in evidence_links:
        if 'evidence_type' in link:
            type_counts[link['evidence_type']] += 1
        if 'match_status' in link:
            match_counts[link['match_status']] += 1
    
    # Describe amount of evidence
    if evidence_links:
        factors.append(f"Analysis based on {len(evidence_links)} pieces of evidence")
    
    # Describe matching evidence
    match_count = match_counts.get('match', 0)
    partial_count = match_counts.get('partial_match', 0)
    
    if match_count > 0:
        s = 's' if match_count > 1 else ''
        factors.append(f"{match_count} direct match{s}")
    
    if partial_count > 0:
        s = 'es' if partial_count > 1 else ''
        factors.append(f"{partial_count} partial match{s}")
    
    # Describe conflicting evidence
    no_match_count = match_counts.get('no_match', 0)
    
    if no_match_count > 0:
        s = 's' if no_match_count > 1 else ''
        factors.append(f"{no_match_count} conflicting item{s}")
    
    # Describe predominant evidence types if applicable
    if type_counts:
        most_common_type = max(type_counts.items(), key=lambda x: x[1])
        if most_common_type[1] >= 3 and most_common_type[1] >= len(evidence_links) * 0.5:
            s = 's' if most_common_type[1] > 1 else ''
            factors.append(f"Predominantly {most_common_type[0]} evidence ({most_common_type[1]} item{s})")
    
    # Create final string
    if factors:
        return ". ".join(factors) + "."
    else:
        return "Insufficient evidence for detailed factor analysis."

def generate_hypothesis(suspect_name, probability):
    """
    Generate a hypothesis statement based on probability level.
    
    Returns:
        str: Hypothesis statement
    """
    if probability >= 0.9:
        return f"Evidence strongly indicates {suspect_name} was involved in the crime"
    elif probability >= 0.75:
        return f"Evidence substantially supports {suspect_name}'s involvement in the crime"
    elif probability >= 0.6:
        return f"Evidence suggests {suspect_name} may have been involved in the crime"
    elif probability >= 0.4:
        return f"Evidence is inconclusive regarding {suspect_name}'s involvement"
    elif probability >= 0.25:
        return f"Evidence provides limited support for {suspect_name}'s non-involvement"
    elif probability >= 0.1:
        return f"Evidence substantially indicates {suspect_name} was not involved"
    else:
        return f"Evidence strongly suggests {suspect_name} was not involved in the crime"
