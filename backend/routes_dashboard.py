from fastapi import APIRouter, Depends
from database import jobs, candidates
from auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

HIRED_STAGE = "Selected"


@router.get("")
async def dashboard(user: dict = Depends(get_current_user)):
    user_jobs = await jobs.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    job_ids = [j["id"] for j in user_jobs]
    all_cands = await candidates.find({"job_id": {"$in": job_ids}}, {"_id": 0}).to_list(10000)

    by_job = {}
    for c in all_cands:
        by_job.setdefault(c["job_id"], []).append(c)

    active_jobs = len([j for j in user_jobs if j.get("status") == "active"])
    total_hired = len([c for c in all_cands if c.get("stage") == HIRED_STAGE])
    in_pipeline = len([c for c in all_cands if c.get("stage") not in (HIRED_STAGE, "Rejected")])
    contact_pending = len([c for c in all_cands if c.get("stage") == "Contact Pending"])
    scored = [c["ai_score"] for c in all_cands if c.get("ai_score") is not None]
    avg_score = round(sum(scored) / len(scored)) if scored else 0

    # Jobs summary
    jobs_summary = []
    for j in user_jobs:
        cs = by_job.get(j["id"], [])
        jobs_summary.append({
            "id": j["id"],
            "title": j["title"],
            "department": j.get("department"),
            "openings_needed": j.get("openings_needed", 1),
            "hired": len([c for c in cs if c.get("stage") == HIRED_STAGE]),
            "candidate_count": len(cs),
            "status": j.get("status"),
            "created_at": j.get("created_at"),
        })

    # Action items
    action_items = []
    if contact_pending > 0:
        action_items.append({"type": "contact_pending", "text": f"{contact_pending} candidate(s) waiting in Contact Pending", "count": contact_pending})
    unanalyzed = len([c for c in all_cands if not c.get("analyzed_at")])
    if unanalyzed > 0:
        action_items.append({"type": "unanalyzed", "text": f"{unanalyzed} candidate(s) have no AI analysis yet", "count": unanalyzed})
    empty_jobs = [j for j in user_jobs if len(by_job.get(j["id"], [])) == 0]
    if empty_jobs:
        action_items.append({"type": "empty_jobs", "text": f"{len(empty_jobs)} job(s) have 0 resumes uploaded", "count": len(empty_jobs)})

    # Upcoming interviews
    upcoming = []
    name_to_job = {j["id"]: j["title"] for j in user_jobs}
    for c in all_cands:
        if c.get("stage") == "Interview Scheduled":
            upcoming.append({
                "id": c["id"],
                "name": c.get("name"),
                "job_title": name_to_job.get(c["job_id"]),
                "note": None,
            })

    return {
        "stats": {
            "active_jobs": active_jobs,
            "total_hired": total_hired,
            "in_pipeline": in_pipeline,
            "contact_pending": contact_pending,
            "avg_score": avg_score,
        },
        "jobs_summary": jobs_summary,
        "action_items": action_items,
        "upcoming_interviews": upcoming,
    }
