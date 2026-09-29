#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================
user_problem_statement: "Reader (deep-dive) screen: chapter numbers duplicated and huge unexplained gaps. Each screen must show only the chapter being read, with the next chapter's number+title at the very bottom; keep the same snap/auto-centering logic."

frontend:
  - task: "Reader chapter sections: one chapter per screen, compact next-chapter preview, no duplicated numbers"
    implemented: true
    working: "NA"
    file: "frontend/src/components/reader-section.tsx, frontend/app/deep-dive/[id].tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Root causes: (1) preview reserve was a 170px estimate causing chapters to overflow by a few px → an extra almost-empty screen with the preview watermark number → 'duplicated numbers + big gaps'; (2) on web, section tops were read from layout.y which never updates when an earlier section grows (onLayout only fires on size change) → snapping to wrong offsets. Fix: compact preview (CAPITOLO 0X + title only, measured at layout), tight mode when overflow ≤120px, tops computed cumulatively from measured heights."

test_plan:
  current_focus:
    - "Reader chapter sections"
  stuck_tasks: []
  test_all: false

agent_communication:
  - agent: "main"
    message: "Please test /deep-dive/sky-blue-sunset-orange?start=1 at 360x720 and 390x844 (web). Also a category rename: topics tab 'Qualsiasi argomento' → 'ESPLORA' with subtitle 'Ogni categoria è una scoperta' (English: EXPLORE / Every category is a discovery)."
  - agent: "main"
    message: "Fixed iteration_1 MEDIUM issue (390x844 initial snap off by 33px): cause was Chrome scroll anchoring shifting scrollTop when a section resized after measurement; now overflow-anchor:none is set on the reader ScrollView node (web only). Please retest initial snap at 390x844 + a quick regression of wheel stepping."
  - agent: "main"
    message: "Reader intro fixes: (1) StoryInfoGrid cells now content-sized for kind/time and flexible for category, wrapped in a glass container (no icon/text overlap for any combination, e.g. MINI LESSON + GEOGRAPHY & TRAVEL); (2) cover title 30% smaller (24/22/20/18px by length); (3) the intro (title, badges, INTRODUCTION hook, scroll hint) must be fully visible on the first screen: the cover height now shrinks (min 200px) via ReaderIntro.onFit measured layout, shared by deep-dive/[id].tsx and story-morph.tsx. Please test on 360x720 and 390x844, several stories incl. lessons and long titles, plus opening a story from the Home card (morph transition) and stepping to chapter 1."
