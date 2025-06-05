export default function Home() {
    return (
        <main className="layout-main">
            <div className="layout-content">
                <div id="search-filters-id" className="layout-content__filters">
                    <select>
                        <option value="">Select Program (V5, IQ, U, etc.)</option>
                        <option value="program1">Program 1</option>
                        <option value="program2">Program 2</option>
                        <option value="program3">Program 3</option>
                    </select>
                    <select>
                        <option value="">Select Region</option>
                        <option value="region1">Region 1</option>
                        <option value="region2">Region 2</option>
                        <option value="region3">Region 3</option>
                    </select>
                    <select>
                        <option value="">Select Event Name</option>
                        <option value="event1">Event 1</option>
                        <option value="event2">Event 2</option>
                        <option value="event3">Event 3</option>
                    </select>
                </div>
            </div>
        </main>
    );
}
