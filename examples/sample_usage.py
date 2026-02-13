#!/usr/bin/env python3
"""
Sample usage script for the Sports Card Tracker.
This demonstrates how to use the tool programmatically or for batch operations.
"""

import subprocess
import sys


def run_command(cmd):
    """Run a card-tracker command and return the result."""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        print(f"$ {cmd}")
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print(f"Error: {result.stderr}")
        print("-" * 50)
        return result.returncode == 0
    except Exception as e:
        print(f"Error running command: {e}")
        return False


def main():
    """Demonstrate various card-tracker operations."""
    print("Sports Card Tracker - Sample Usage")
    print("=" * 50)
    
    # Sample cards to add
    sample_cards = [
        {
            "player": "Wayne Gretzky",
            "sport": "hockey",
            "year": 1979,
            "brand": "O-Pee-Chee",
            "card_number": "18",
            "team": "Edmonton Oilers",
            "condition": "PSA 8",
            "value": 25000,
            "tags": "rookie,legend,investment",
            "notes": "The Great One's rookie card"
        },
        {
            "player": "LeBron James",
            "sport": "basketball", 
            "year": 2003,
            "brand": "Topps Chrome",
            "card_number": "111",
            "team": "Cleveland Cavaliers",
            "condition": "BGS 9.5",
            "value": 12000,
            "tags": "rookie,refractor,king",
            "notes": "Refractor parallel"
        },
        {
            "player": "Derek Jeter",
            "sport": "baseball",
            "year": 1993,
            "brand": "SP",
            "card_number": "279",
            "team": "New York Yankees",
            "condition": "PSA 10",
            "value": 15000,
            "tags": "rookie,yankees,captain",
            "notes": "Perfect 10, Yankees legend"
        }
    ]
    
    # Add sample cards
    print("Adding sample cards...")
    for card in sample_cards:
        cmd = (f"card-tracker add "
               f"--player \"{card['player']}\" "
               f"--sport {card['sport']} "
               f"--year {card['year']} "
               f"--brand \"{card['brand']}\" "
               f"--card-number \"{card['card_number']}\" "
               f"--team \"{card['team']}\" "
               f"--condition \"{card['condition']}\" "
               f"--value {card['value']} "
               f"--tags \"{card['tags']}\" "
               f"--notes \"{card['notes']}\"")
        run_command(cmd)
    
    # Show collection stats
    print("\nCollection Statistics:")
    run_command("card-tracker stats")
    
    # List all cards
    print("\nAll Cards in Collection:")
    run_command("card-tracker list")
    
    # Search for rookie cards
    print("\nRookie Cards:")
    run_command("card-tracker search rookie")
    
    # Filter by sport
    print("\nBasketball Cards:")
    run_command("card-tracker list --sport basketball")
    
    # Update a card value
    print("\nUpdating LeBron James card value...")
    run_command("card-tracker update-value 2003_topps_chrome_111_lebron_james 13500 --source \"Market update\"")
    
    # Show detailed card info
    print("\nDetailed Card Information:")
    run_command("card-tracker show 2003_topgs_chrome_111_lebron_james")
    
    print("Sample usage complete!")
    print("\nTry these commands yourself:")
    print("- card-tracker --help")
    print("- card-tracker list")
    print("- card-tracker stats")
    print("- card-tracker search [term]")


if __name__ == "__main__":
    main()