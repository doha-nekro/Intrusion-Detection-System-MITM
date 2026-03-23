"""
Mock Model for Synapse IDS
Used as fallback when the trained .pkl model is not available.
"""

import random
import numpy as np


class MockModel:
    """
    A mock classifier that simulates IDS predictions.
    Returns random Attack/Normal labels with configurable attack probability.
    """
    
    def __init__(self, attack_probability: float = 0.15):
        """
        Initialize the mock model.
        
        Args:
            attack_probability: Probability of classifying a packet as an attack (0.0-1.0)
        """
        self.attack_probability = attack_probability
        self.classes_ = np.array(['Normal', 'Attack'])
    
    def predict(self, X) -> np.ndarray:
        """
        Generate random predictions for input data.
        
        Args:
            X: Input features (shape doesn't matter for mock)
            
        Returns:
            Array of predictions ('Attack' or 'Normal')
        """
        n_samples = len(X) if hasattr(X, '__len__') else X.shape[0]
        predictions = []
        
        for _ in range(n_samples):
            if random.random() < self.attack_probability:
                predictions.append('Attack')
            else:
                predictions.append('Normal')
        
        return np.array(predictions)
    
    def predict_proba(self, X) -> np.ndarray:
        """
        Generate random probability predictions.
        
        Args:
            X: Input features
            
        Returns:
            Array of shape (n_samples, 2) with probabilities for [Normal, Attack]
        """
        n_samples = len(X) if hasattr(X, '__len__') else X.shape[0]
        probabilities = []
        
        for _ in range(n_samples):
            attack_prob = random.random()
            if attack_prob > 0.85:  # Force some clear attacks
                attack_prob = random.uniform(0.85, 0.99)
            elif attack_prob < 0.15:  # Force some clear normal
                attack_prob = random.uniform(0.01, 0.15)
            
            probabilities.append([1 - attack_prob, attack_prob])
        
        return np.array(probabilities)


def get_mock_model() -> MockModel:
    """Factory function to create a mock model instance."""
    return MockModel(attack_probability=0.15)
