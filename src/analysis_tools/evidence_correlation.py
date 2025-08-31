import numpy as np
from datetime import datetime
import re

def find_evidence_correlations(evidence_data, min_strength=0.3):
    """
    Analyzes evidence items to find correlations between them.
    
    Args:
        evidence_data (list): List of dictionaries containing evidence information
        min_strength (float): Minimum correlation strength threshold (0-1)
        
    Returns:
        list: List of correlation dictionaries with correlation details
    """
    correlations = []
    
    # Skip if less than 2 evidence items
    if len(evidence_data) < 2:
        return correlations
    
    # For each pair of evidence items
    for i in range(len(evidence_data)):
        for j in range(i+1, len(evidence_data)):
            evidence_a = evidence_data[i]
            evidence_b = evidence_data[j]
            
            # Calculate temporal correlation (time proximity)
            temporal_score = calculate_temporal_correlation(evidence_a, evidence_b)
            
            # Calculate spatial correlation (location similarity)
            spatial_score = calculate_spatial_correlation(evidence_a, evidence_b)
            
            # Calculate content correlation (description similarity)
            content_score = calculate_content_correlation(evidence_a, evidence_b)
            
            # Calculate type correlation
            type_score = 1.0 if evidence_a.get('type') == evidence_b.get('type') else 0.0
            
            # Calculate overall correlation strength (weighted average)
            weights = {
                'temporal': 0.3,
                'spatial': 0.3,
                'content': 0.3,
                'type': 0.1
            }
            
            overall_strength = (
                temporal_score * weights['temporal'] +
                spatial_score * weights['spatial'] +
                content_score * weights['content'] +
                type_score * weights['type']
            )
            
            # Only include correlations above the threshold
            if overall_strength >= min_strength:
                correlation_types = []
                if temporal_score >= 0.7:
                    correlation_types.append('temporal')
                if spatial_score >= 0.7:
                    correlation_types.append('spatial')
                if content_score >= 0.7:
                    correlation_types.append('content')
                if type_score >= 0.7:
                    correlation_types.append('type')
                
                if not correlation_types:
                    correlation_types.append('composite')
                
                # Generate description
                description = generate_correlation_description(
                    evidence_a, evidence_b, temporal_score, spatial_score, 
                    content_score, type_score, correlation_types
                )
                
                # Add to results
                correlations.append({
                    'evidence_a_id': evidence_a['id'],
                    'evidence_a_number': evidence_a['evidence_number'],
                    'evidence_b_id': evidence_b['id'],
                    'evidence_b_number': evidence_b['evidence_number'],
                    'correlation_type': ','.join(correlation_types),
                    'correlation_strength': round(overall_strength, 2),
                    'description': description,
                    'detected_by': 'Automated Correlation Analysis',
                    'temporal_score': round(temporal_score, 2),
                    'spatial_score': round(spatial_score, 2),
                    'content_score': round(content_score, 2),
                    'type_score': round(type_score, 2)
                })
    
    # Sort by correlation strength descending
    correlations.sort(key=lambda x: x['correlation_strength'], reverse=True)
    
    return correlations

def calculate_temporal_correlation(evidence_a, evidence_b):
    """
    Calculate temporal correlation (time proximity) between two evidence items.
    
    Returns:
        float: Correlation score between 0 and 1
    """
    # Check if date info is available
    if not evidence_a.get('date') or not evidence_b.get('date'):
        return 0.0
    
    try:
        # Parse dates
        date_a = datetime.fromisoformat(evidence_a['date'])
        date_b = datetime.fromisoformat(evidence_b['date'])
        
        # Calculate time difference in hours
        time_diff = abs((date_a - date_b).total_seconds()) / 3600
        
        # Calculate score (closer = higher score)
        # 0 hours apart = 1.0, 24 hours apart = 0.5, 72+ hours apart = 0.0
        max_hours = 72
        score = max(0, 1 - (time_diff / max_hours))
        
        return score
    except:
        return 0.0

def calculate_spatial_correlation(evidence_a, evidence_b):
    """
    Calculate spatial correlation (location similarity) between two evidence items.
    
    Returns:
        float: Correlation score between 0 and 1
    """
    # Check if location info is available
    if not evidence_a.get('location') or not evidence_b.get('location'):
        return 0.0
    
    location_a = evidence_a['location'].lower()
    location_b = evidence_b['location'].lower()
    
    # Exact match
    if location_a == location_b:
        return 1.0
    
    # Partial match - look for common significant terms
    # Extract all words from locations
    words_a = set(re.findall(r'\b\w+\b', location_a))
    words_b = set(re.findall(r'\b\w+\b', location_b))
    
    # Calculate Jaccard similarity
    if not words_a or not words_b:
        return 0.0
        
    intersection = len(words_a.intersection(words_b))
    union = len(words_a.union(words_b))
    
    return intersection / union

def calculate_content_correlation(evidence_a, evidence_b):
    """
    Calculate content correlation (description similarity) between two evidence items.
    
    Returns:
        float: Correlation score between 0 and 1
    """
    # Check if description info is available
    if not evidence_a.get('description') or not evidence_b.get('description'):
        return 0.0
    
    description_a = evidence_a['description'].lower()
    description_b = evidence_b['description'].lower()
    
    # Extract all significant words from descriptions
    words_a = set(re.findall(r'\b\w{3,}\b', description_a))  # Words of 3+ chars
    words_b = set(re.findall(r'\b\w{3,}\b', description_b))
    
    # Calculate Jaccard similarity
    if not words_a or not words_b:
        return 0.0
        
    intersection = len(words_a.intersection(words_b))
    union = len(words_a.union(words_b))
    
    return intersection / union

def generate_correlation_description(evidence_a, evidence_b, temporal_score, 
                                     spatial_score, content_score, type_score, 
                                     correlation_types):
    """
    Generate human-readable description of the correlation.
    
    Returns:
        str: Correlation description
    """
    parts = []
    
    # Type correlation
    if 'type' in correlation_types:
        parts.append(f"Both items are {evidence_a.get('type', 'unknown')} evidence")
    
    # Temporal correlation
    if 'temporal' in correlation_types:
        try:
            date_a = datetime.fromisoformat(evidence_a.get('date', ''))
            date_b = datetime.fromisoformat(evidence_b.get('date', ''))
            time_diff = abs((date_a - date_b).total_seconds()) / 3600
            
            if time_diff < 1:
                parts.append(f"Collected within the same hour")
            elif time_diff < 24:
                parts.append(f"Collected approximately {int(time_diff)} hours apart")
            else:
                days = int(time_diff / 24)
                parts.append(f"Collected {days} day{'s' if days > 1 else ''} apart")
        except:
            pass
    
    # Spatial correlation
    if 'spatial' in correlation_types:
        loc_a = evidence_a.get('location', '')
        loc_b = evidence_b.get('location', '')
        
        if loc_a == loc_b:
            parts.append(f"Both found at the same location ({loc_a})")
        else:
            parts.append(f"Found at related locations ({loc_a} and {loc_b})")
    
    # Content correlation
    if 'content' in correlation_types:
        parts.append("Show similarities in their descriptions")
    
    # Combine all parts
    if parts:
        description = ". ".join(parts) + "."
    else:
        description = "Multiple factors suggest these evidence items may be related."
    
    return description
