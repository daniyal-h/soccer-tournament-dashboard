# Mutation Testing

Tool: mutmut \
Date of Test: Sun May 24 20:07:51 CDT 2026

## Scope

Mutation testing was run against backend service-layer business logic, including:

- standings logic
- cache handling
- tournament retrieval
- rate limiting
- admin authentication
- refresh job handling

Framework wiring, schemas, repositories, and ORM models were excluded to focus mutation testing on decision-making logic rather than infrastructure boilerplate.

## Result

No surviving mutants remain in the targeted modules.

## Commands

```bash
mutmut run
mutmut results
```

# Report

    app.api.v1.services.cache.x_get_cache__mutmut_1: killed
    app.api.v1.services.cache.x_get_cache__mutmut_2: killed
    app.api.v1.services.cache.x_get_cache__mutmut_3: killed
    app.api.v1.services.cache.x_get_cache__mutmut_4: killed
    app.api.v1.services.cache.x_get_cache__mutmut_5: killed
    app.api.v1.services.cache.x_get_cache__mutmut_6: killed
    app.api.v1.services.cache.x_get_cache__mutmut_7: killed
    app.api.v1.services.cache.x_get_cache__mutmut_8: killed
    app.api.v1.services.cache.x_get_cache__mutmut_9: killed
    app.api.v1.services.cache.x_get_cache__mutmut_10: killed
    app.api.v1.services.cache.x_set_cache__mutmut_1: killed
    app.api.v1.services.cache.x_set_cache__mutmut_2: killed
    app.api.v1.services.cache.x_set_cache__mutmut_3: killed
    app.api.v1.services.cache.x_set_cache__mutmut_4: killed
    app.api.v1.services.cache.x_set_cache__mutmut_5: killed
    app.api.v1.services.cache.x_set_cache__mutmut_6: killed
    app.api.v1.services.cache.x_set_cache__mutmut_7: killed
    app.api.v1.services.cache.x_set_cache__mutmut_8: killed
    app.api.v1.services.cache.x_set_cache__mutmut_9: killed
    app.api.v1.services.cache.x_invalidate_cache__mutmut_1: killed
    app.api.v1.services.cache.x_invalidate_cache__mutmut_2: killed
    app.api.v1.services.cache.x_invalidate_cache__mutmut_3: killed
    app.api.v1.services.cache.x_invalidate_cache__mutmut_4: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_1: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_2: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_3: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_4: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_5: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_6: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_7: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_8: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_9: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_10: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_11: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_12: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_13: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_14: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_15: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_16: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_17: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_18: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_19: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_20: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_21: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_22: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_23: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_24: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_25: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_26: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_27: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_28: killed
    app.api.v1.services.standings.x_build_zero_state_standings__mutmut_29: killed
    app.api.v1.services.standings.x_get_standings__mutmut_1: killed
    app.api.v1.services.standings.x_get_standings__mutmut_2: killed
    app.api.v1.services.standings.x_get_standings__mutmut_3: killed
    app.api.v1.services.standings.x_get_standings__mutmut_4: killed
    app.api.v1.services.standings.x_get_standings__mutmut_5: killed
    app.api.v1.services.standings.x_get_standings__mutmut_6: killed
    app.api.v1.services.standings.x_get_standings__mutmut_7: killed
    app.api.v1.services.standings.x_get_standings__mutmut_8: killed
    app.api.v1.services.standings.x_get_standings__mutmut_9: killed
    app.api.v1.services.standings.x_get_standings__mutmut_10: killed
    app.api.v1.services.standings.x_get_standings__mutmut_11: killed
    app.api.v1.services.standings.x_get_standings__mutmut_12: killed
    app.api.v1.services.standings.x_get_standings__mutmut_13: killed
    app.api.v1.services.standings.x_get_standings__mutmut_14: killed
    app.api.v1.services.standings.x_get_standings__mutmut_15: killed
    app.api.v1.services.standings.x_get_standings__mutmut_16: killed
    app.api.v1.services.standings.x_get_standings__mutmut_17: killed
    app.api.v1.services.standings.x_get_standings__mutmut_18: killed
    app.api.v1.services.standings.x_get_standings__mutmut_19: killed
    app.api.v1.services.standings.x_get_standings__mutmut_20: killed
    app.api.v1.services.standings.x_get_standings__mutmut_21: killed
    app.api.v1.services.standings.x_get_standings__mutmut_22: killed
    app.api.v1.services.standings.x_get_standings__mutmut_23: killed
    app.api.v1.services.standings.x_get_standings__mutmut_24: killed
    app.api.v1.services.standings.x_get_standings__mutmut_25: killed
    app.api.v1.services.standings.x_get_standings__mutmut_26: killed
    app.api.v1.services.standings.x_get_standings__mutmut_27: killed
    app.api.v1.services.standings.x_get_standings__mutmut_28: killed
    app.api.v1.services.standings.x_get_standings__mutmut_29: killed
    app.api.v1.services.standings.x_get_standings__mutmut_30: killed
    app.api.v1.services.standings.x_get_standings__mutmut_31: killed
    app.api.v1.services.standings.x_get_standings__mutmut_32: killed
    app.api.v1.services.standings.x_get_standings__mutmut_33: killed
    app.api.v1.services.standings.x_get_standings__mutmut_34: killed
    app.api.v1.services.standings.x_get_standings__mutmut_35: killed
    app.api.v1.services.standings.x_get_standings__mutmut_36: killed
    app.api.v1.services.standings.x_get_standings__mutmut_37: killed
    app.api.v1.services.standings.x_get_standings__mutmut_38: killed
    app.api.v1.services.standings.x_get_standings__mutmut_39: killed
    app.api.v1.services.standings.x_get_standings__mutmut_40: killed
    app.api.v1.services.standings.x_get_standings__mutmut_41: killed
    app.api.v1.services.standings.x_get_standings__mutmut_42: killed
    app.api.v1.services.standings.x_get_standings__mutmut_43: killed
    app.api.v1.services.standings.x_get_standings__mutmut_44: killed
    app.api.v1.services.standings.x_get_standings__mutmut_45: killed
    app.api.v1.services.standings.x_get_standings__mutmut_46: killed
    app.api.v1.services.standings.x_get_standings__mutmut_47: killed
    app.api.v1.services.standings.x_get_standings__mutmut_48: killed
    app.api.v1.services.standings.x_get_standings__mutmut_49: killed
    app.api.v1.services.standings.x_get_standings__mutmut_50: killed
    app.api.v1.services.standings.x_get_standings__mutmut_51: killed
    app.api.v1.services.standings.x_get_standings__mutmut_52: killed
    app.api.v1.services.standings.x_get_standings__mutmut_53: killed
    app.api.v1.services.standings.x_get_standings__mutmut_54: killed
    app.api.v1.services.standings.x_get_standings__mutmut_55: killed
    app.api.v1.services.standings.x_get_standings__mutmut_56: killed
    app.api.v1.services.standings.x_get_standings__mutmut_57: killed
    app.api.v1.services.standings.x_get_standings__mutmut_58: killed
    app.api.v1.services.standings.x_update_standings__mutmut_1: killed
    app.api.v1.services.standings.x_update_standings__mutmut_2: killed
    app.api.v1.services.standings.x_update_standings__mutmut_3: killed
    app.api.v1.services.standings.x_update_standings__mutmut_4: killed
    app.api.v1.services.standings.x_update_standings__mutmut_5: killed
    app.api.v1.services.standings.x_update_standings__mutmut_6: killed
    app.api.v1.services.standings.x_update_standings__mutmut_7: killed
    app.api.v1.services.standings.x_update_standings__mutmut_8: killed
    app.api.v1.services.standings.x_update_standings__mutmut_9: killed
    app.api.v1.services.standings.x_update_standings__mutmut_10: killed
    app.api.v1.services.standings.x_update_standings__mutmut_11: killed
    app.api.v1.services.standings.x_update_standings__mutmut_12: killed
    app.api.v1.services.standings.x_update_standings__mutmut_13: killed
    app.api.v1.services.standings.x_update_standings__mutmut_14: killed
    app.api.v1.services.standings.x_update_standings__mutmut_15: killed
    app.api.v1.services.standings.x_update_standings__mutmut_16: killed
    app.api.v1.services.standings.x_update_standings__mutmut_17: killed
    app.api.v1.services.standings.x_update_standings__mutmut_18: killed
    app.api.v1.services.standings.x_update_standings__mutmut_19: killed
    app.api.v1.services.standings.x_update_standings__mutmut_20: killed
    app.api.v1.services.standings.x_update_standings__mutmut_21: killed
    app.api.v1.services.standings.x_update_standings__mutmut_22: killed
    app.api.v1.services.standings.x_update_standings__mutmut_23: killed
    app.api.v1.services.standings.x_update_standings__mutmut_24: killed
    app.api.v1.services.standings.x_update_standings__mutmut_25: killed
    app.api.v1.services.standings.x_update_standings__mutmut_26: killed
    app.api.v1.services.standings.x_update_standings__mutmut_27: killed
    app.api.v1.services.standings.x_update_standings__mutmut_28: killed
    app.api.v1.services.standings.x_update_standings__mutmut_29: killed
    app.api.v1.services.standings.x_update_standings__mutmut_30: killed
    app.api.v1.services.standings.x_update_standings__mutmut_31: killed
    app.api.v1.services.standings.x_update_standings__mutmut_32: killed
    app.api.v1.services.standings.x_update_standings__mutmut_33: killed
    app.api.v1.services.standings.x_update_standings__mutmut_34: killed
    app.api.v1.services.standings.x_update_standings__mutmut_35: killed
    app.api.v1.services.standings.x_update_standings__mutmut_36: killed
    app.api.v1.services.standings.x_update_standings__mutmut_37: killed
    app.api.v1.services.standings.x_update_standings__mutmut_38: killed
    app.api.v1.services.standings.x_update_standings__mutmut_39: killed
    app.api.v1.services.standings.x_update_standings__mutmut_40: killed
    app.api.v1.services.standings.x_update_standings__mutmut_41: killed
    app.api.v1.services.standings.x_update_standings__mutmut_42: killed
    app.api.v1.services.standings.x_update_standings__mutmut_43: killed
    app.api.v1.services.standings.x_update_standings__mutmut_44: killed
    app.api.v1.services.standings.x_update_standings__mutmut_45: killed
    app.api.v1.services.standings.x_update_standings__mutmut_46: killed
    app.api.v1.services.standings.x_update_standings__mutmut_47: killed
    app.api.v1.services.standings.x_update_standings__mutmut_48: killed
    app.api.v1.services.standings.x_update_standings__mutmut_49: killed
    app.api.v1.services.standings.x_update_standings__mutmut_50: killed
    app.api.v1.services.standings.x_update_standings__mutmut_51: killed
    app.api.v1.services.standings.x_update_standings__mutmut_52: killed
    app.api.v1.services.standings.x_update_standings__mutmut_53: killed
    app.api.v1.services.standings.x_update_standings__mutmut_54: killed
    app.api.v1.services.standings.x_update_standings__mutmut_55: killed
    app.api.v1.services.standings.x_update_standings__mutmut_56: killed
    app.api.v1.services.teams.x_get_team_id_from_external_id__mutmut_1: killed
    app.api.v1.services.teams.x_get_team_id_from_external_id__mutmut_2: killed
    app.api.v1.services.teams.x_get_team_id_from_external_id__mutmut_3: killed
    app.api.v1.services.teams.x_get_team_id_from_external_id__mutmut_4: killed
    app.api.v1.services.teams.x_get_team_id_from_external_id__mutmut_5: killed
    app.api.v1.services.teams.x_get_team_id_from_external_id__mutmut_6: killed
    app.api.v1.services.teams.x_get_team_id_from_external_id__mutmut_7: killed
    app.api.v1.services.tournaments.x_get_tournaments__mutmut_1: killed
    app.api.v1.services.tournaments.x_get_tournaments__mutmut_2: killed
    app.api.v1.services.tournaments.x_get_tournaments__mutmut_3: killed
    app.api.v1.services.tournaments.x_get_tournaments__mutmut_4: killed
    app.api.v1.services.tournaments.x_get_tournaments__mutmut_5: killed
    app.api.v1.services.tournaments.x_get_tournaments__mutmut_6: killed
    app.api.v1.services.tournaments.x_get_tournaments__mutmut_7: killed
    app.api.v1.services.tournaments.x_get_tournament__mutmut_1: killed
    app.api.v1.services.tournaments.x_get_tournament__mutmut_2: killed
    app.api.v1.services.tournaments.x_get_tournament__mutmut_3: killed
    app.api.v1.services.tournaments.x_get_tournament__mutmut_4: killed
    app.api.v1.services.tournaments.x_get_tournament__mutmut_5: killed
    app.api.v1.services.tournaments.x_get_tournament__mutmut_6: killed
    app.api.v1.services.tournaments.x_get_tournament__mutmut_7: killed
    app.api.v1.services.tournament_teams.x_get_tournament_teams__mutmut_1: killed
    app.api.v1.services.tournament_teams.x_get_tournament_teams__mutmut_2: killed
    app.api.v1.services.tournament_teams.x_get_tournament_teams__mutmut_3: killed
    app.api.v1.services.tournament_teams.x_get_tournament_teams__mutmut_4: killed
    app.api.v1.services.tournament_teams.x_get_tournament_teams__mutmut_5: killed
    app.api.v1.services.tournament_teams.x_get_tournament_teams__mutmut_6: killed
    app.api.v1.services.tournament_teams.x_get_tournament_teams__mutmut_7: killed
    app.core.auth.x_verify_admin_token__mutmut_1: killed
    app.core.auth.x_verify_admin_token__mutmut_2: killed
    app.core.auth.x_verify_admin_token__mutmut_3: killed
    app.core.auth.x_verify_admin_token__mutmut_4: killed
    app.core.auth.x_verify_admin_token__mutmut_5: killed
    app.core.auth.x_verify_admin_token__mutmut_6: killed
    app.utils.cache.x_get_expires_at__mutmut_1: killed
    app.utils.cache.x_get_expires_at__mutmut_2: killed
    app.utils.cache.x_get_standings_ttl__mutmut_1: killed
    app.utils.cache.x_get_standings_ttl__mutmut_2: killed
    app.utils.cache.x_get_standings_ttl__mutmut_3: killed
    app.utils.cache.x_get_standings_ttl__mutmut_4: killed
    app.utils.cache.x_get_standings_ttl__mutmut_5: killed
    app.utils.cache.x_get_standings_ttl__mutmut_6: killed
