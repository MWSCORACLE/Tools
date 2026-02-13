"""Command-line interface for the sports card tracker."""

import click
from decimal import Decimal, InvalidOperation
from datetime import datetime
from tabulate import tabulate
from typing import List, Optional

from .models import SportsCard, MarketValue
from .database import CardDatabase


def format_currency(value: Optional[Decimal]) -> str:
    """Format a decimal value as currency."""
    if value is None:
        return "N/A"
    return f"${value:.2f}"


def format_card_table(cards: List[SportsCard]) -> str:
    """Format cards as a table."""
    if not cards:
        return "No cards found."
    
    headers = ["ID", "Player", "Year", "Brand", "Card #", "Sport", "Team", "Current Value", "Condition"]
    rows = []
    
    for card in cards:
        rows.append([
            card.id[:30] + "..." if len(card.id) > 30 else card.id,
            card.player,
            card.year,
            card.brand,
            card.card_number,
            card.sport,
            card.team,
            format_currency(card.current_value),
            card.condition
        ])
    
    return tabulate(rows, headers=headers, tablefmt="grid")


@click.group()
@click.version_option(version="1.0.0")
@click.pass_context
def main(ctx):
    """Sports Card Tracker - Manage your sports card collection and track market values."""
    ctx.ensure_object(dict)
    ctx.obj['db'] = CardDatabase()


@main.command()
@click.option('--player', required=True, help='Player name')
@click.option('--sport', required=True, help='Sport (e.g., baseball, basketball, football)')
@click.option('--year', required=True, type=int, help='Card year')
@click.option('--brand', required=True, help='Card brand/manufacturer')
@click.option('--card-number', required=True, help='Card number')
@click.option('--team', default='', help='Player team')
@click.option('--condition', default='NM', help='Card condition (e.g., MT, NM, EX, VG, G, P)')
@click.option('--value', type=float, help='Initial market value')
@click.option('--notes', default='', help='Additional notes')
@click.option('--tags', help='Comma-separated tags')
@click.pass_context
def add(ctx, player, sport, year, brand, card_number, team, condition, value, notes, tags):
    """Add a new sports card to your collection."""
    db = ctx.obj['db']
    
    # Create card name
    name = f"{year} {brand} #{card_number} {player}"
    
    # Parse tags
    tag_list = [tag.strip() for tag in tags.split(',')] if tags else []
    
    card = SportsCard(
        id="",  # Will be auto-generated
        name=name,
        sport=sport,
        year=year,
        brand=brand,
        card_number=card_number,
        player=player,
        team=team,
        condition=condition,
        notes=notes,
        tags=tag_list
    )
    
    # Add initial market value if provided
    if value is not None:
        try:
            card.add_market_value(Decimal(str(value)))
        except InvalidOperation:
            click.echo("Error: Invalid value format", err=True)
            return
    
    if db.add_card(card):
        click.echo(f"✅ Added card: {card.name}")
        click.echo(f"   Card ID: {card.id}")
    else:
        click.echo(f"❌ Card with ID '{card.id}' already exists", err=True)


@main.command()
@click.option('--player', help='Filter by player name')
@click.option('--sport', help='Filter by sport')
@click.option('--year', type=int, help='Filter by year')
@click.option('--brand', help='Filter by brand')
@click.option('--team', help='Filter by team')
@click.option('--tags', help='Filter by tags (comma-separated)')
@click.option('--limit', type=int, default=50, help='Maximum number of results to show')
@click.pass_context
def list(ctx, player, sport, year, brand, team, tags, limit):
    """List sports cards in your collection."""
    db = ctx.obj['db']
    
    # Parse tags
    tag_list = [tag.strip() for tag in tags.split(',')] if tags else None
    
    # Search cards
    cards = db.search_cards(
        player=player,
        sport=sport,
        year=year,
        brand=brand,
        team=team,
        tags=tag_list
    )
    
    # Apply limit
    if limit and len(cards) > limit:
        cards = cards[:limit]
        click.echo(f"Showing first {limit} results (total: {len(db.load_cards())} cards)")
    
    click.echo(format_card_table(cards))


@main.command()
@click.argument('card_id')
@click.pass_context
def show(ctx, card_id):
    """Show detailed information about a specific card."""
    db = ctx.obj['db']
    
    card = db.get_card(card_id)
    if not card:
        click.echo(f"❌ Card with ID '{card_id}' not found", err=True)
        return
    
    click.echo("=" * 60)
    click.echo(f"Card: {card.name}")
    click.echo("=" * 60)
    click.echo(f"ID: {card.id}")
    click.echo(f"Player: {card.player}")
    click.echo(f"Sport: {card.sport}")
    click.echo(f"Year: {card.year}")
    click.echo(f"Brand: {card.brand}")
    click.echo(f"Card Number: {card.card_number}")
    click.echo(f"Team: {card.team}")
    click.echo(f"Condition: {card.condition}")
    click.echo(f"Current Value: {format_currency(card.current_value)}")
    click.echo(f"Tags: {', '.join(card.tags) if card.tags else 'None'}")
    click.echo(f"Notes: {card.notes or 'None'}")
    click.echo(f"Added: {card.created_date.strftime('%Y-%m-%d %H:%M')}")
    
    if card.market_values:
        click.echo("\nValue History:")
        click.echo("-" * 40)
        for mv in card.value_history:
            click.echo(f"  {mv.date.strftime('%Y-%m-%d')}: {format_currency(mv.value)} ({mv.condition}, {mv.source})")


@main.command()
@click.argument('card_id')
@click.argument('value', type=float)
@click.option('--condition', help='Card condition for this value')
@click.option('--source', default='manual', help='Source of the value')
@click.pass_context
def update_value(ctx, card_id, value, condition, source):
    """Update the market value of a card."""
    db = ctx.obj['db']
    
    card = db.get_card(card_id)
    if not card:
        click.echo(f"❌ Card with ID '{card_id}' not found", err=True)
        return
    
    try:
        card.add_market_value(
            Decimal(str(value)), 
            source=source, 
            condition=condition
        )
        
        if db.update_card(card):
            click.echo(f"✅ Updated value for {card.name}: {format_currency(Decimal(str(value)))}")
        else:
            click.echo("❌ Failed to update card", err=True)
    except InvalidOperation:
        click.echo("❌ Invalid value format", err=True)


@main.command()
@click.argument('card_id')
@click.confirmation_option(prompt='Are you sure you want to delete this card?')
@click.pass_context
def delete(ctx, card_id):
    """Delete a card from your collection."""
    db = ctx.obj['db']
    
    card = db.get_card(card_id)
    if not card:
        click.echo(f"❌ Card with ID '{card_id}' not found", err=True)
        return
    
    if db.delete_card(card_id):
        click.echo(f"✅ Deleted card: {card.name}")
    else:
        click.echo("❌ Failed to delete card", err=True)


@main.command()
@click.pass_context
def stats(ctx):
    """Show collection statistics."""
    db = ctx.obj['db']
    
    stats = db.get_statistics()
    
    click.echo("=" * 40)
    click.echo("COLLECTION STATISTICS")
    click.echo("=" * 40)
    click.echo(f"Total Cards: {stats['total_cards']}")
    click.echo(f"Total Value: {format_currency(stats['total_value'])}")
    
    if stats['sports']:
        click.echo("\nBy Sport:")
        for sport, count in sorted(stats['sports'].items()):
            click.echo(f"  {sport}: {count}")
    
    if stats['brands']:
        click.echo("\nBy Brand:")
        for brand, count in sorted(stats['brands'].items()):
            click.echo(f"  {brand}: {count}")
    
    if stats['years']:
        click.echo("\nBy Year:")
        for year, count in sorted(stats['years'].items(), reverse=True):
            click.echo(f"  {year}: {count}")


@main.command()
@click.argument('search_term')
@click.pass_context  
def search(ctx, search_term):
    """Search for cards by player name, sport, brand, or team."""
    db = ctx.obj['db']
    
    all_cards = db.load_cards()
    results = []
    
    search_lower = search_term.lower()
    
    for card in all_cards:
        if (search_lower in card.player.lower() or
            search_lower in card.sport.lower() or
            search_lower in card.brand.lower() or
            search_lower in card.team.lower() or
            any(search_lower in tag.lower() for tag in card.tags)):
            results.append(card)
    
    if results:
        click.echo(f"Found {len(results)} card(s) matching '{search_term}':")
        click.echo(format_card_table(results))
    else:
        click.echo(f"No cards found matching '{search_term}'")


if __name__ == '__main__':
    main()