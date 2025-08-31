import numpy as np
from datetime import datetime
import re
from collections import Counter, defaultdict

def detect_patterns(evidence_data, min_confidence=0.5):
    """
    Analyzes evidence items to detect patterns such as temporal patterns, 
    spatial patterns, method patterns, etc.
    
    Args:
        evidence_data (list): List of dictionaries containing evidence information
        min_confidence (float): Minimum confidence threshold (0-1)
        
    Returns:
        list: List of pattern dictionaries with details
    """
    patterns = []
    
    # Skip if insufficient evidence items
    if len(evidence_data) < 3:
        return patterns
    
    # Detect temporal patterns
    temporal_patterns = detect_temporal_patterns(evidence_data, min_confidence)
    patterns.extend(temporal_patterns)
    
    # Detect spatial patterns
    spatial_patterns = detect_spatial_patterns(evidence_data, min_confidence)
    patterns.extend(spatial_patterns)
    
    # Detect evidence type patterns
    type_patterns = detect_type_patterns(evidence_data, min_confidence)
    patterns.extend(type_patterns)
    
    # Detect content patterns
    content_patterns = detect_content_patterns(evidence_data, min_confidence)
    patterns.extend(content_patterns)
    
    # Sort by confidence score descending
    patterns.sort(key=lambda x: x['confidence_score'], reverse=True)
    
    return patterns

def detect_temporal_patterns(evidence_data, min_confidence):
    """
    Detect time-based patterns in evidence collection.
    
    Returns:
        list: Temporal patterns detected
    """
    patterns = []
    
    # Extract valid evidence dates
    dated_evidence = []
    for evidence in evidence_data:
        if evidence.get('date'):
            try:
                date = datetime.fromisoformat(evidence['date'])
                dated_evidence.append({
                    'id': evidence['id'],
                    'evidence_number': evidence['evidence_number'],
                    'date': date,
                    'type': evidence.get('type')
                })
            except:
                continue
    
    # Skip if insufficient dated evidence
    if len(dated_evidence) < 3:
        return patterns
    
    # Sort evidence by date
    dated_evidence.sort(key=lambda x: x['date'])
    
    # Check for regular time intervals
    intervals = []
    for i in range(1, len(dated_evidence)):
        interval = (dated_evidence[i]['date'] - dated_evidence[i-1]['date']).total_seconds() / 3600
        intervals.append(interval)
    
    # Analyze interval consistency
    if intervals:
        avg_interval = sum(intervals) / len(intervals)
        if avg_interval <= 48:  # Only consider patterns within 2 days
            # Calculate standard deviation
            std_dev = np.std(intervals)
            variation_coef = std_dev / avg_interval if avg_interval > 0 else float('inf')
            
            # Lower variation coefficient means more consistent intervals
            if variation_coef < 0.5:
                confidence = max(0, min(1, 1 - variation_coef))
                
                if confidence >= min_confidence:
                    # Format interval in a human-readable way
                    if avg_interval < 1:
                        interval_desc = f"{int(avg_interval * 60)} minutes"
                    elif avg_interval < 24:
                        interval_desc = f"{int(avg_interval)} hours"
                    else:
                        interval_desc = f"{avg_interval / 24:.1f} days"
                    
                    # Create pattern object
                    evidence_ids = ",".join([str(e['id']) for e in dated_evidence])
                    
                    pattern = {
                        'pattern_name': f"Regular time interval pattern ({interval_desc})",
                        'description': f"Evidence items were collected or created at regular intervals of approximately {interval_desc}.",
                        'detection_method': "Temporal interval analysis",
                        'confidence_score': round(confidence, 2),
                        'evidence_ids': evidence_ids,
                        'pattern_type': 'temporal',
                        'details': {
                            'average_interval_hours': avg_interval,
                            'variation_coefficient': variation_coef
                        }
                    }
                    
                    patterns.append(pattern)
    
    # Check for time of day patterns
    hours = [e['date'].hour for e in dated_evidence]
    hour_counts = Counter(hours)
    
    # If more than 3 items occur in the same hour and it's at least 60% of the items
    most_common_hour, count = hour_counts.most_common(1)[0]
    if count >= 3 and count >= len(dated_evidence) * 0.6:
        confidence = min(1.0, count / len(dated_evidence))
        
        if confidence >= min_confidence:
            hour_str = f"{most_common_hour:02d}:00-{most_common_hour+1:02d}:00"
            
            # Identify evidence in this pattern
            pattern_evidence = [e for e in dated_evidence if e['date'].hour == most_common_hour]
            evidence_ids = ",".join([str(e['id']) for e in pattern_evidence])
            
            pattern = {
                'pattern_name': f"Time of day pattern ({hour_str})",
                'description': f"Multiple evidence items were collected or created during the same time window ({hour_str}).",
                'detection_method': "Time of day analysis",
                'confidence_score': round(confidence, 2),
                'evidence_ids': evidence_ids,
                'pattern_type': 'temporal',
                'details': {
                    'hour_of_day': most_common_hour,
                    'items_in_pattern': count,
                    'total_items': len(dated_evidence)
                }
            }
            
            patterns.append(pattern)
    
    return patterns

def detect_spatial_patterns(evidence_data, min_confidence):
    """
    Detect location-based patterns in evidence.
    
    Returns:
        list: Spatial patterns detected
    """
    patterns = []
    
    # Extract evidence with location data
    located_evidence = []
    for evidence in evidence_data:
        if evidence.get('location'):
            located_evidence.append({
                'id': evidence['id'],
                'evidence_number': evidence['evidence_number'],
                'location': evidence.get('location'),
                'type': evidence.get('type')
            })
    
    # Skip if insufficient located evidence
    if len(located_evidence) < 3:
        return patterns
    
    # Count occurrences of each location
    location_counts = Counter([e['location'] for e in located_evidence])
    
    # Find locations with multiple evidence items
    for location, count in location_counts.items():
        if count >= 3:
            confidence = min(1.0, count / len(located_evidence))
            
            if confidence >= min_confidence:
                # Identify evidence at this location
                location_evidence = [e for e in located_evidence if e['location'] == location]
                evidence_ids = ",".join([str(e['id']) for e in location_evidence])
                
                # Check if all items are of the same type
                types = Counter([e['type'] for e in location_evidence])
                most_common_type, type_count = types.most_common(1)[0]
                
                if type_count == count:
                    # All items of same type at this location
                    pattern = {
                        'pattern_name': f"Location-specific {most_common_type} evidence",
                        'description': f"Multiple {most_common_type} evidence items were found at the same location: {location}.",
                        'detection_method': "Location clustering analysis",
                        'confidence_score': round(confidence, 2),
                        'evidence_ids': evidence_ids,
                        'pattern_type': 'spatial',
                        'details': {
                            'location': location,
                            'items_at_location': count,
                            'evidence_type': most_common_type,
                            'total_items': len(located_evidence)
                        }
                    }
                else:
                    # Mixed types at this location
                    pattern = {
                        'pattern_name': f"Evidence concentration at {location}",
                        'description': f"Multiple evidence items of different types were found at the same location: {location}.",
                        'detection_method': "Location clustering analysis",
                        'confidence_score': round(confidence, 2),
                        'evidence_ids': evidence_ids,
                        'pattern_type': 'spatial',
                        'details': {
                            'location': location,
                            'items_at_location': count,
                            'evidence_types': dict(types),
                            'total_items': len(located_evidence)
                        }
                    }
                
                patterns.append(pattern)
    
    # Look for sequential movement patterns
    # This would require more sophisticated spatial analysis
    
    return patterns

def detect_type_patterns(evidence_data, min_confidence):
    """
    Detect patterns in evidence types.
    
    Returns:
        list: Type-based patterns detected
    """
    patterns = []
    
    # Extract evidence with type data
    typed_evidence = []
    for evidence in evidence_data:
        if evidence.get('type'):
            typed_evidence.append({
                'id': evidence['id'],
                'evidence_number': evidence['evidence_number'],
                'type': evidence.get('type'),
                'date': evidence.get('date')
            })
    
    # Skip if insufficient evidence
    if len(typed_evidence) < 3:
        return patterns
    
    # Count occurrences of each type
    type_counts = Counter([e['type'] for e in typed_evidence])
    
    # Find predominant evidence types
    for evidence_type, count in type_counts.items():
        if count >= 3 and count >= len(typed_evidence) * 0.5:  # At least 50% of items
            confidence = min(1.0, count / len(typed_evidence))
            
            if confidence >= min_confidence:
                # Identify evidence of this type
                type_evidence = [e for e in typed_evidence if e['type'] == evidence_type]
                evidence_ids = ",".join([str(e['id']) for e in type_evidence])
                
                pattern = {
                    'pattern_name': f"Predominant {evidence_type} evidence",
                    'description': f"The case contains a high proportion of {evidence_type} evidence ({count} out of {len(typed_evidence)} items).",
                    'detection_method': "Evidence type distribution analysis",
                    'confidence_score': round(confidence, 2),
                    'evidence_ids': evidence_ids,
                    'pattern_type': 'typological',
                    'details': {
                        'evidence_type': evidence_type,
                        'count': count,
                        'percentage': round(count / len(typed_evidence) * 100, 1),
                        'total_items': len(typed_evidence)
                    }
                }
                
                patterns.append(pattern)
    
    # Check for chronological type sequences
    if len(typed_evidence) >= 4 and all(e.get('date') for e in typed_evidence):
        # Sort evidence by date
        dated_evidence = []
        for evidence in typed_evidence:
            try:
                date = datetime.fromisoformat(evidence['date'])
                evidence_copy = evidence.copy()
                evidence_copy['date_obj'] = date
                dated_evidence.append(evidence_copy)
            except:
                continue
                
        if len(dated_evidence) >= 4:
            dated_evidence.sort(key=lambda x: x['date_obj'])
            
            # Check for repeating sequences
            types_sequence = [e['type'] for e in dated_evidence]
            
            # Look for repeating sequences of length 2-3
            for seq_len in range(2, 4):
                if len(types_sequence) >= seq_len * 2:  # Need at least two repetitions
                    sequences = defaultdict(list)
                    
                    # Extract all subsequences and their positions
                    for i in range(len(types_sequence) - seq_len + 1):
                        subseq = tuple(types_sequence[i:i+seq_len])
                        sequences[subseq].append(i)
                    
                    # Find repeating sequences
                    for subseq, positions in sequences.items():
                        if len(positions) >= 2:
                            # Calculate average distance between repetitions
                            distances = [positions[i+1] - positions[i] for i in range(len(positions)-1)]
                            avg_distance = sum(distances) / len(distances)
                            
                            # Calculate variation in distances
                            if len(distances) > 1:
                                std_dev = np.std(distances)
                                variation_coef = std_dev / avg_distance if avg_distance > 0 else float('inf')
                                regularity = max(0, min(1, 1 - variation_coef))
                            else:
                                regularity = 0.5  # Only one distance, moderate confidence
                            
                            # Calculate overall confidence based on repetitions and regularity
                            confidence = min(1.0, len(positions) / (len(typed_evidence) / seq_len) * 0.7 + regularity * 0.3)
                            
                            if confidence >= min_confidence:
                                # Get evidence IDs involved in this pattern
                                pattern_evidence_ids = []
                                for pos in positions:
                                    for i in range(seq_len):
                                        if pos + i < len(dated_evidence):
                                            pattern_evidence_ids.append(dated_evidence[pos + i]['id'])
                                
                                evidence_ids = ",".join(map(str, pattern_evidence_ids))
                                
                                pattern = {
                                    'pattern_name': f"Repeating evidence sequence: {' → '.join(subseq)}",
                                    'description': f"A sequence of evidence types ({' → '.join(subseq)}) appears repeatedly in chronological order.",
                                    'detection_method': "Sequential pattern analysis",
                                    'confidence_score': round(confidence, 2),
                                    'evidence_ids': evidence_ids,
                                    'pattern_type': 'sequential',
                                    'details': {
                                        'sequence': subseq,
                                        'repetitions': len(positions),
                                        'avg_distance': avg_distance,
                                        'regularity': round(regularity, 2)
                                    }
                                }
                                
                                patterns.append(pattern)
    
    return patterns

def detect_content_patterns(evidence_data, min_confidence):
    """
    Detect patterns in evidence descriptions and content.
    
    Returns:
        list: Content-based patterns detected
    """
    patterns = []
    
    # Extract evidence with description data
    described_evidence = []
    for evidence in evidence_data:
        if evidence.get('description'):
            described_evidence.append({
                'id': evidence['id'],
                'evidence_number': evidence['evidence_number'],
                'description': evidence.get('description').lower(),
                'type': evidence.get('type')
            })
    
    # Skip if insufficient evidence
    if len(described_evidence) < 3:
        return patterns
    
    # Extract significant terms from descriptions
    all_terms = []
    evidence_terms = {}
    
    for evidence in described_evidence:
        terms = re.findall(r'\b\w{4,}\b', evidence['description'])  # Words of 4+ chars
        filtered_terms = [term for term in terms if not term.isdigit()]  # Remove numbers
        
        if filtered_terms:
            evidence_terms[evidence['id']] = filtered_terms
            all_terms.extend(filtered_terms)
    
    # Count term frequencies
    term_counts = Counter(all_terms)
    
    # Find common significant terms
    for term, count in term_counts.items():
        if count >= 3 and term not in ['evidence', 'found', 'collected', 'located']:
            # Calculate percentage of evidence items containing this term
            evidence_with_term = sum(1 for terms in evidence_terms.values() if term in terms)
            percentage = evidence_with_term / len(described_evidence)
            
            confidence = min(1.0, percentage * 0.7 + (count / len(all_terms)) * 0.3)
            
            if confidence >= min_confidence:
                # Get evidence IDs containing this term
                term_evidence_ids = [eid for eid, terms in evidence_terms.items() if term in terms]
                evidence_ids = ",".join(map(str, term_evidence_ids))
                
                # Check what types of evidence contain this term
                term_evidence_types = [e['type'] for e in described_evidence if e['id'] in term_evidence_ids and e.get('type')]
                type_counts = Counter(term_evidence_types)
                
                if type_counts:
                    most_common_type, type_count = type_counts.most_common(1)[0]
                    type_specificity = type_count / len(term_evidence_ids) if term_evidence_ids else 0
                    
                    if type_specificity > 0.8 and len(term_evidence_ids) >= 3:
                        # Term is highly associated with a specific evidence type
                        pattern = {
                            'pattern_name': f"Term '{term}' in {most_common_type} evidence",
                            'description': f"The term '{term}' appears frequently in {most_common_type} evidence descriptions ({evidence_with_term} items).",
                            'detection_method': "Textual content analysis",
                            'confidence_score': round(confidence, 2),
                            'evidence_ids': evidence_ids,
                            'pattern_type': 'content',
                            'details': {
                                'term': term,
                                'occurrences': count,
                                'evidence_items': evidence_with_term,
                                'evidence_type': most_common_type,
                                'type_specificity': round(type_specificity, 2)
                            }
                        }
                    else:
                        # Term appears across different evidence types
                        pattern = {
                            'pattern_name': f"Common term: '{term}'",
                            'description': f"The term '{term}' appears frequently across different types of evidence ({evidence_with_term} items).",
                            'detection_method': "Textual content analysis",
                            'confidence_score': round(confidence, 2),
                            'evidence_ids': evidence_ids,
                            'pattern_type': 'content',
                            'details': {
                                'term': term,
                                'occurrences': count,
                                'evidence_items': evidence_with_term,
                                'evidence_types': dict(type_counts)
                            }
                        }
                    
                    patterns.append(pattern)
    
    return patterns
