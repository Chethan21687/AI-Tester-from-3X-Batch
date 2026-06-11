"""Workflow / Kanban specs. Maps TC-031 (FR9)."""
from __future__ import annotations

import pytest

from pages import PlanBoardPage


@pytest.mark.functional
@pytest.mark.requires_auth
def test_create_kanban_backlog_card(authenticated_page, settings):
    """TC-031 - new idea card appears on the Plan board."""
    board = PlanBoardPage(authenticated_page, settings).goto()
    before = board.card_count()
    board.add_card("Auto idea: hero CTA test")
    board.expect_card_present("Auto idea: hero CTA test")
    assert board.card_count() >= before
