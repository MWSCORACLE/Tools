from setuptools import setup, find_packages

setup(
    name="sports-card-tracker",
    version="1.0.0",
    description="A CLI tool for tracking and managing sports card market values",
    packages=find_packages(),
    install_requires=[
        "click>=8.0.0",
        "requests>=2.28.0",
        "tabulate>=0.9.0",
        "python-dateutil>=2.8.0",
    ],
    entry_points={
        "console_scripts": [
            "card-tracker=sports_card_tracker.cli:main",
        ],
    },
    python_requires=">=3.7",
)