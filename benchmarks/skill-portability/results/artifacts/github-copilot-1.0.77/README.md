# GitHub Copilot CLI 1.0.77 artifacts

This directory contains the sanitized raw session exports and generated map
artifacts for the first submitted portability result. Absolute temporary
fixture paths were replaced with `<fixture-root>`; no model output or observed
failure was rewritten.

All three fresh sessions used Copilot Auto, which selected `gpt-5-mini`. The
direct run used the router's low reasoning bucket; implicit and negative used
medium. Built-in MCP was disabled, file access stayed inside each synthetic
fixture, and only npm URLs were allowlisted.

The direct artifact independently validates with receipt:

`c4f6761c7b225262b59c63e0ed321b6deba8346b1e97a4022f842d6d2da52517`

The implicit artifact is intentionally committed in its observed invalid
state. Independent validation reports three invalid source URL findings. It is
evidence of a failed run, not a template to copy.
