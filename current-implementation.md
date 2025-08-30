# Data Explorer setup from `Home.tsx`

1. **Page wrapper**
   - `Home.tsx` renders only the chat message body and is wrapped by `HomeLayout` via the `withHomeLayout` HOC, keeping page logic thin and layout‑driven

2. **Layout orchestration**
   - `HomeLayout` manages chat state, suggestions, and a resizable right pane. When the chat context equals `action-explore-data`, the right pane widens and displays data‑exploration content, with recommendations fetched through `useRecommendation('explorer')`

3. **Initiating exploration**
   - Selecting “Explore Data” either from the actions list or the “+” menu sets the context to `action-explore-data` without immediately calling the backend
   - Choosing a connection triggers `createConversation` to obtain a thread ID, while `ChatInput` later submits the user’s query to `processExploreQuery` when in explorer context

4. **Chat service hand‑off**
   - `ChatService.processExploreQuery` shows a short assistant message and immediately opens a `RightAsideComponent` of type `explore-data`, passing the query, connection, and thread ID with no intermediate card

5. **Right‑side rendering**
   - `RightAsideComponent` switches on `componentId`; for `explore-data` it renders `ExploreDataComponent`, keeping the panel open until closed and relaying success messages as needed

6. **Streaming analysis UI**
   - `ExploreDataComponent` streams results via `useConversation.streamConversation`, parsing SSE chunks (`MetaStarted`, `Identify`, `SQL`, `TABLE`, `EXPLANATION`, `MetaCompleted`) to update state and display progress with `StreamingStepIndicator`, final metrics, tables, SQL, and Plotly‑based charts in `OverviewTab`

7. **Chat message interaction**
   - `ChatMessages` still routes card clicks for other workflows; data exploration now skips the card step and opens the panel directly when the user submits a query


