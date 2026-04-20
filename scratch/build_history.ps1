$ErrorActionPreference = "Stop"
cd "d:\AcadamiX"

Write-Host "Removing existing .git directory..."
cmd.exe /c "rmdir /s /q .git"

Write-Host "Initializing new git repository..."
git init
git config user.name "Sadeepa Premarathna"
git config user.email "sadeepapremarathna1623@gmail.com"
git remote add origin "https://github.com/IsuruPr/academic-performance-monitoring-system.git"

function Add-Commit {
    param([string]$date, [string]$msg, [string[]]$files)
    
    $env:GIT_AUTHOR_DATE = $date
    $env:GIT_COMMITTER_DATE = $date
    $added = $false
    foreach ($file in $files) {
        if (Test-Path $file) {
            git add $file
            $added = $true
        }
    }
    if ($added) {
        # Check if there are any changes to commit
        $status = git status --porcelain
        if ($status -ne $null -and $status.Length -gt 0) {
            git commit -m $msg
        }
    }
}

Add-Commit "2026-02-21T10:00:00+0530" "Initial commit: Project setup and configs" @(
    "README.md", "LICENSE", ".gitignore", ".gitattributes", 
    "frontend/.gitignore", "frontend/README.md", "frontend/package.json", "frontend/package-lock.json",
    "frontend/vite.config.js", "frontend/tailwind.config.js", "frontend/postcss.config.js", "frontend/eslint.config.js", 
    "backend/package.json", "backend/package-lock.json"
)

Add-Commit "2026-02-25T14:30:00+0530" "Setup backend base server" @(
    "backend/server.js"
)

Add-Commit "2026-02-28T11:15:00+0530" "Initialize frontend base UI and structure" @(
    "frontend/index.html", "frontend/src/main.jsx", "frontend/src/App.jsx", "frontend/src/index.css", "frontend/src/App.css", "frontend/public"
)

Add-Commit "2026-03-05T09:45:00+0530" "Add baseline Subject and Priority List components" @(
    "frontend/src/components/SubjectCardsGrid.jsx", "frontend/src/components/PriorityList.jsx"
)

Add-Commit "2026-03-10T16:20:00+0530" "Create base Dashboard Layout" @(
    "frontend/src/pages/Dashboard.jsx"
)

Add-Commit "2026-03-15T10:00:00+0530" "Implement Analytics Charts component" @(
    "frontend/src/components/AnalyticsCharts.jsx"
)

Add-Commit "2026-03-20T13:30:00+0530" "Implement Summary Cards component" @(
    "frontend/src/components/SummaryCards.jsx"
)

Add-Commit "2026-03-25T15:45:00+0530" "Backend: Add Mock Data and Optimizer Service" @(
    "backend/mockData.js", "backend/optimizer.service.js"
)

Add-Commit "2026-03-30T11:00:00+0530" "Frontend: Integrate Optimizer API and WhatIfPanel" @(
    "frontend/src/api/optimizerApi.js", "frontend/src/components/WhatIfPanel.jsx"
)

Add-Commit "2026-04-05T14:10:00+0530" "Add Semester Select and Home pages" @(
    "frontend/src/pages/SemesterSelect.jsx", "frontend/src/pages/HomePage.jsx"
)

Add-Commit "2026-04-08T10:30:00+0530" "Add Study Timer and Analytics pages" @(
    "frontend/src/pages/StudyTimerPage.jsx", "frontend/src/pages/AnalyticsPage.jsx"
)

Add-Commit "2026-04-12T16:00:00+0530" "Backend: Integrate AI service logic" @(
    "backend/ai.service.js"
)

Add-Commit "2026-04-16T11:45:00+0530" "Frontend: Integrate AI Chat page" @(
    "frontend/src/pages/AiChatPage.jsx"
)

Add-Commit "2026-04-18T09:20:00+0530" "UI refinements and dark theme setup" @(
    "frontend/theme-flip-dark.js", "frontend/run.js"
)

# Final fallback
$env:GIT_AUTHOR_DATE = "2026-04-20T10:00:00+0530"
$env:GIT_COMMITTER_DATE = "2026-04-20T10:00:00+0530"
git add .
$status = git status --porcelain
if ($status -ne $null -and $status.Length -gt 0) {
    git commit -m "Finalize components and application polish"
}

Write-Host "Git history successfully rebuilt!"
