"""Completed-game cards, archive numbering, sets and deterministic prestige."""

from __future__ import annotations

import time
from uuid import NAMESPACE_URL, uuid5

import archive_storage as store
import bounties
from prestige import generate_prestige_challenge

RARITIES = ("common", "uncommon", "rare", "legendary", "mythic")
STATUSES = ("draft", "approved", "printed", "archived")


def next_number(user):
    key = store.prefix(user, "metadata") + "archive-number"
    return store.mutate(key, lambda value: int(value or 0) + 1, default=0)


def create(user, body):
    game_id = store.identifier(body.get("game_id"))
    game, _achievements = store.game(game_id)
    if game["status"] not in bounties.FINISHED:
        raise store.ArchiveError("A card can only be created for a game marked Beaten or Mastered.")
    set_id = body.get("set_id")
    if set_id:
        set_id = store.get(user, "sets", set_id)["id"]
    rarity = body.get("rarity")
    if rarity is not None:
        store.choice(rarity, RARITIES, "rarity")
    return store.create(user, "cards", {"game_id": game_id, "set_id": set_id,
        "archive_number": next_number(user), "rarity": rarity, "bounty_id": None,
        "card_customization": body.get("card_customization"), "status": "draft", "updated_at": int(time.time())})


def edit(user, value, body):
    fields = {key: body[key] for key in ("set_id", "rarity", "card_customization", "status") if key in body}
    if fields.get("set_id"):
        fields["set_id"] = store.get(user, "sets", fields["set_id"])["id"]
    if fields.get("rarity") is not None:
        store.choice(fields["rarity"], RARITIES, "rarity")
    if "status" in fields:
        store.choice(fields["status"], STATUSES, "card status")
    fields["updated_at"] = int(time.time())
    return store.update(user, "cards", value, lambda saved: {**saved, **fields})


def prestige(user, value):
    card = store.get(user, "cards", value)
    if card.get("bounty_id"):
        return card
    game, achievements = store.game(card["game_id"])
    if not achievements:
        raise store.ArchiveError("This game has no tracked achievements, so 100% completion can't be verified.")
    if any(not item["unlocked"] for item in achievements):
        raise store.ArchiveError("Every achievement must be unlocked before a prestige challenge can be generated.")
    challenge = generate_prestige_challenge(game, achievements)
    bounty_id = str(uuid5(NAMESPACE_URL, "collector-prestige:" + user + ":" + card["id"]))
    try:
        bounties.create(user, {"title": challenge.title, "description": challenge.description,
            "game_id": card["game_id"], "type": "challenge",
            "progress_mode": "binary"}, record_id=bounty_id, auto_generated=True)
    except store.ArchiveError as exc:
        if exc.status != 409:
            raise
        store.get(user, "bounties", bounty_id)
    return store.update(user, "cards", value, lambda saved: {**saved,
        "bounty_id": saved.get("bounty_id") or bounty_id, "updated_at": int(time.time())})


def set_read(user, value, *, detail=False):
    saved = store.get(user, "sets", value)
    cards = sorted((item for item in store.records(user, "cards") if item.get("set_id") == saved["id"]),
        key=lambda item: item.get("archive_number") or 0)
    target = saved.get("target_total")
    result = {**saved, "card_count": len(cards), "is_complete": bool(target is not None and len(cards) >= target)}
    if detail:
        result["cards"] = cards
    return result


def set_save(user, body, value=None):
    existing = store.get(user, "sets", value) if value else {}
    name = store.title(body.get("name", existing.get("name")), field="Set name", maximum=200)
    if any(item["name"] == name and item["id"] != value for item in store.records(user, "sets")):
        raise store.ArchiveError(f"A set named '{name}' already exists.", 409)
    target = body.get("target_total", existing.get("target_total"))
    if target is not None:
        target = store.number(target, "Target total", minimum=1)
        if not target.is_integer():
            raise store.ArchiveError("Target total must be a whole number.")
        target = int(target)
    fields = {"name": name, "description": body.get("description", existing.get("description")),
        "target_total": target, "updated_at": int(time.time())}
    if value:
        saved = store.update(user, "sets", value, lambda record: {**record, **fields})
    else:
        saved = store.create(user, "sets", fields)
    return set_read(user, saved["id"])


def set_delete(user, value):
    set_id = store.get(user, "sets", value)["id"]
    store.remove(user, "sets", set_id)
    for card in store.records(user, "cards"):
        if card.get("set_id") == set_id:
            edit(user, card["id"], {"set_id": None})
