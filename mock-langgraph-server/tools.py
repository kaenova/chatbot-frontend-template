"""Tools for the LangGraph agent."""
from datetime import datetime
from typing import Any, Dict
from langchain_core.tools import tool


@tool
def get_current_time() -> str:
    """Get the current date and time.
    
    Returns:
        str: Current date and time in ISO format
    """
    return datetime.now().isoformat()


# List of available tools
AVAILABLE_TOOLS = [get_current_time]