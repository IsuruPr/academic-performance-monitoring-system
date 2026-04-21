git filter-branch -f --env-filter '
    python -c "
import os
def shift(d):
    p = d.split(\" \", 1)
    new_ts = int(p[0].lstrip(\"@\")) - 30*24*3600
    return f\"@{new_ts} {p[1]}\"
print(\"export GIT_AUTHOR_DATE='\''\" + shift(os.environ[\"GIT_AUTHOR_DATE\"]) + \"'\''\")
print(\"export GIT_COMMITTER_DATE='\''\" + shift(os.environ[\"GIT_COMMITTER_DATE\"]) + \"'\''\")
" > set_dates.sh
    source set_dates.sh
' HEAD
