# Sports Card Tracker

A comprehensive CLI tool for tracking and managing your sports card collection and their market values. Perfect for collectors who want to monitor their investments and organize their cards efficiently.

## Features

- 📊 **Track Market Values**: Monitor your cards' current and historical market values
- 🔍 **Advanced Search**: Find cards by player, sport, brand, team, or tags
- 📈 **Value History**: Keep track of how your cards' values change over time
- 🏷️ **Tagging System**: Organize cards with custom tags (rookie, autograph, investment, etc.)
- 📋 **Collection Statistics**: Get insights into your collection's composition and value
- 💾 **Data Persistence**: Automatic JSON file storage with backup functionality
- 🎯 **Flexible Filtering**: Filter your collection by multiple criteria

## Installation

### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)

### Install from Source
```bash
git clone https://github.com/MWSCORACLE/Tools.git
cd Tools
pip install -e .
```

### Install Dependencies Only
```bash
pip install -r requirements.txt
```

## Quick Start

After installation, the `card-tracker` command will be available:

```bash
# Add your first card
card-tracker add --player "Michael Jordan" --sport basketball --year 1986 --brand "Fleer" --card-number "57" --team "Chicago Bulls" --condition "PSA 9" --value 150000 --notes "Rookie card" --tags "rookie,legendary"

# List all cards
card-tracker list

# View collection statistics
card-tracker stats

# Search for specific cards
card-tracker search "rookie"
```

## Commands

### `add` - Add a New Card
Add a sports card to your collection:

```bash
card-tracker add --player "Ken Griffey Jr" --sport baseball --year 1989 --brand "Upper Deck" --card-number "1" --team "Seattle Mariners" --condition "MT" --value 8000 --notes "Upper Deck rookie" --tags "rookie,hall-of-fame"
```

**Required Options:**
- `--player`: Player name
- `--sport`: Sport (baseball, basketball, football, hockey, etc.)
- `--year`: Card year
- `--brand`: Card brand/manufacturer
- `--card-number`: Card number

**Optional Options:**
- `--team`: Player's team
- `--condition`: Card condition (MT, NM, EX, VG, G, P, or graded like "PSA 10")
- `--value`: Initial market value
- `--notes`: Additional notes
- `--tags`: Comma-separated tags

### `list` - List Cards
Display cards in your collection:

```bash
# List all cards
card-tracker list

# Filter by sport
card-tracker list --sport basketball

# Filter by player
card-tracker list --player "Michael Jordan"

# Filter by multiple criteria
card-tracker list --sport baseball --year 1989 --tags "rookie"

# Limit results
card-tracker list --limit 10
```

### `show` - View Card Details
Show detailed information about a specific card:

```bash
card-tracker show 1986_fleer_57_michael_jordan
```

### `search` - Search Cards
Search across all card fields:

```bash
# Search by player name
card-tracker search "Jordan"

# Search by brand
card-tracker search "Upper Deck"

# Search by tag
card-tracker search "rookie"
```

### `update-value` - Update Market Value
Add a new market value entry for a card:

```bash
card-tracker update-value 1989_upper_deck_1_ken_griffey_jr 9500 --source "eBay sold listing" --condition "PSA 9"
```

### `stats` - Collection Statistics
View statistics about your collection:

```bash
card-tracker stats
```

Shows:
- Total number of cards
- Total collection value
- Breakdown by sport, brand, and year

### `delete` - Remove Card
Delete a card from your collection (with confirmation):

```bash
card-tracker delete 1986_fleer_57_michael_jordan
```

## Data Storage

- Cards are stored in `~/.sports_card_tracker/cards.json`
- Automatic backups are created before each save
- Up to 10 backup files are retained in `~/.sports_card_tracker/backups/`

## Card Conditions

Common card conditions supported:
- **MT** (Mint): Perfect condition
- **NM** (Near Mint): Very slight wear
- **EX** (Excellent): Light wear
- **VG** (Very Good): Moderate wear
- **G** (Good): Heavy wear
- **P** (Poor): Severe wear
- **Graded**: PSA 10, BGS 9.5, SGC 9, etc.

## Integration with Claude

This tool is designed to work seamlessly with Claude AI. You can:

1. **Export Data**: Use `card-tracker list` to get formatted tables
2. **Generate Reports**: Use `card-tracker stats` for collection summaries
3. **Search and Filter**: Find specific cards to discuss with Claude
4. **Value Tracking**: Get current values and trends for investment decisions

Example Claude integration workflow:
```bash
# Get current collection status
card-tracker stats

# Search for high-value cards
card-tracker list --limit 10 | head -20

# Get detailed info on specific cards
card-tracker show [card-id]
```

## Examples

### Adding Different Types of Cards

```bash
# Baseball rookie card
card-tracker add --player "Ronald Acuña Jr." --sport baseball --year 2018 --brand "Topps Chrome" --card-number "193" --team "Atlanta Braves" --condition "PSA 10" --value 1200 --tags "rookie,refractor"

# Autographed football card
card-tracker add --player "Peyton Manning" --sport football --year 1998 --brand "SP Authentic" --card-number "14" --team "Indianapolis Colts" --condition "BGS 9" --value 800 --tags "autograph,quarterback" --notes "On-card autograph"

# Vintage basketball card
card-tracker add --player "Kareem Abdul-Jabbar" --sport basketball --year 1969 --brand "Topps" --card-number "25" --team "Milwaukee Bucks" --condition "EX" --value 2500 --tags "vintage,hall-of-fame,rookie"
```

### Searching and Filtering

```bash
# Find all rookie cards
card-tracker list --tags "rookie"

# Find cards from specific year
card-tracker list --year 1986

# Find high-value cards (manual filtering after listing)
card-tracker list | grep "\$[5-9][0-9],[0-9][0-9][0-9]"

# Search by team
card-tracker list --team "Lakers"
```

### Managing Values Over Time

```bash
# Add initial value
card-tracker add --player "Luka Dončić" --sport basketball --year 2018 --brand "Panini Prizm" --card-number "280" --value 500

# Update value after good performance
card-tracker update-value 2018_panini_prizm_280_luka_dončić 750 --source "COMC average"

# Update again after playoff run
card-tracker update-value 2018_panini_prizm_280_luka_dončić 950 --source "eBay sold"
```

## Tips for Collectors

1. **Consistent Naming**: Use consistent player names and team names
2. **Regular Updates**: Update values monthly or after significant events
3. **Tag Strategy**: Use tags like "rookie", "autograph", "refractor", "investment"
4. **Condition Notes**: Be specific about condition, especially for valuable cards
5. **Source Tracking**: Always note the source when updating values
6. **Backup Data**: The tool automatically backs up, but consider additional backups

## Contributing

This tool is part of the MWSCORACLE/Tools repository. Contributions are welcome!

## License

MIT License - see the repository for details.