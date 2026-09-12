"""
Maps SPDX license identifiers into broad license "families" so the
classifier has a small, balanced target instead of a dozen sparse
exact-license classes.

Permissive: minimal restrictions, can be reused in closed-source projects
            (MIT, Apache-2.0, BSD variants, ISC, etc.)
Copyleft:   derivative works must stay open-source under similar terms
            (GPL, LGPL, AGPL, MPL, EPL, etc.)
Unknown:    no license detected, GitHub couldn't determine one, or the
            id isn't in our known lists (treated conservatively)
"""

PERMISSIVE = {
    "MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC",
    "Zlib", "BSL-1.0", "Unlicense", "CC0-1.0", "WTFPL", "0BSD",
}

COPYLEFT = {
    "GPL-2.0", "GPL-3.0", "LGPL-2.1", "LGPL-3.0", "AGPL-3.0",
    "MPL-2.0", "EPL-1.0", "EPL-2.0", "CDDL-1.0", "OSL-3.0",
}


def to_license_family(spdx_id):
    """Collapse a specific SPDX id into a broader license family."""
    if not spdx_id or spdx_id in ("Unknown", "NOASSERTION"):
        return "Unknown"
    if spdx_id in PERMISSIVE:
        return "Permissive"
    if spdx_id in COPYLEFT:
        return "Copyleft"
    return "Unknown"
