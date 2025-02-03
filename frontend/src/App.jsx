import { useState, useEffect } from "react";
import axios from "axios";
import Swal from 'sweetalert2';  // Import SweetAlert2

// Function to get the current date in the format '1st Feb 2025'
const getCurrentDate = () => {
    const date = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
};

export default function App() {
    const [namesInput, setNamesInput] = useState("");
    const [attendedWithOtherBatches, setAttendedWithOtherBatches] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [jsonNames, setJsonNames] = useState([]);  // JSON names list
    const [attendees, setAttendees] = useState([]);
    const [absentees, setAbsentees] = useState([]);
    const [combinedResult, setCombinedResult] = useState("");  // Combined result
    const [selectedDate, setSelectedDate] = useState(getCurrentDate()); // default to current date
    const [selectedTime, setSelectedTime] = useState("04:30 PM - 05:30 PM"); // default time
    const [topic, setTopic] = useState(""); // New state for topic
    const [tldvLink, setTldvLink] = useState(""); // New state for TLDV link
    const [reportBy, setReportBy] = useState(""); // New state for report by
    const [notes, setNotes] = useState(""); // New state for notes

    useEffect(() => {
        // Fetch names from the backend (your batchList.json or other source)
        axios.get("http://localhost:5000/names")
            .then(response => setJsonNames(response.data))
            .catch(error => console.error("Error fetching names:", error));

        // Load previously selected names from localStorage
        const savedNames = JSON.parse(localStorage.getItem("attendedWithOtherBatches")) || [];
        setAttendedWithOtherBatches(savedNames);
    }, []);

    useEffect(() => {
        // Save selected names to localStorage
        localStorage.setItem("attendedWithOtherBatches", JSON.stringify(attendedWithOtherBatches));
    }, [attendedWithOtherBatches]);

    const handleNamesInputChange = (e) => setNamesInput(e.target.value);

    const handleSearchQueryChange = (e) => {
        setSearchQuery(e.target.value);

        if (e.target.value.length > 0) {
            const filteredSuggestions = jsonNames.filter(name =>
                name.toLowerCase().includes(e.target.value.toLowerCase())
            );
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    };

    const handleSelectSuggestion = (name) => {
        if (attendedWithOtherBatches.some(item => item.name === name)) return; // Avoid duplicates

        setAttendedWithOtherBatches(prev => [...prev, { name, extra: "" }]);
        // Remove selected name from jsonNames
        setJsonNames(prev => prev.filter(item => item !== name));

        setSearchQuery("");
        setSuggestions([]);
    };

    const handleExtraTextChange = (index, value) => {
        setAttendedWithOtherBatches(prev => {
            const updated = [...prev];
            updated[index].extra = value;
            return updated;
        });
    };

    const handleRemoveAttendee = (index) => {
        const removedName = attendedWithOtherBatches[index].name;
        setAttendedWithOtherBatches(prev => prev.filter((_, i) => i !== index));

        // Restore removed name back to the jsonNames list
        setJsonNames(prev => [...prev, removedName]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Collect the names from the input field and remove extra whitespace
        const pastedNames = namesInput
            .split("\n")
            .map(name => name.trim())
            .filter(name => name !== "");

        if (pastedNames.length === 0 && attendedWithOtherBatches.length === 0) {
            return alert("Please enter valid names to compare!");
        }

        try {
            const { data } = await axios.post("http://localhost:5000/update-attendance", {
                names: jsonNames, // Correctly use jsonNames here
                attendedWithOtherBatches, // Names with extra text
                attendanceInput: pastedNames // Admin-pasted attendance names
            });

            console.log('Backend Response:', data); // Debugging log

            if (data && Array.isArray(data.attendees) && Array.isArray(data.absentees)) {
                setAttendees(data.attendees.sort());
                setAbsentees(data.absentees.sort());
                // Combine attendees and absentees into one result
                setCombinedResult({
                    attendees: data.attendees,
                    absentees: data.absentees
                });
                Swal.fire({
                    text:'You are officially Lazy!',
                    title: `🎉🎉Congrats!🎉🎉`,
                    width: 400,
                    padding: "1 em",
                    color: "#",
                    background: "#fff url(/public/cloud.jpg)",
                    backdrop: `
                      rgba(0,0,12,0.4)
                      url("https://sweetalert2.github.io/images/nyan-cat.gif")
                      left top
                      no-repeat
                    `
                  });
            } else {
                console.error("Unexpected data structure:", data);
            }
        } catch (error) {
            console.error("Error in request:", error.response || error.message);
        }
    };

    // Function to format the result for textarea
    const formatResultForTextarea = () => {
        const attendeesText = attendees.map(name => `${name}`).join("\n");
        const absenteesText = absentees.map(name => `${name}`).join("\n");

        return `Session Report
➖➖➖➖➖➖➖➖
👥 BCR56/57
📆 ${selectedDate}
🕒 ${selectedTime}

Communication Trainer:
🧑🏻‍🏫 Afzal Nazar

Coordinators:
🧑🏻‍💻 🧑🏻‍💻 Nazil and Karthikeyan K

🏳 Topic: ${topic}

${notes}

Attendees🙋‍♀🙋🏻‍♂: 
----------
${attendeesText}

Absentees🙅🏻‍♂🙅🏻‍♀:
----------
${absenteesText}

======================

TLDV Link: ${tldvLink}

======================

✍️ ${reportBy}`;
    };

    // Copy to clipboard function
    const copyToClipboard = () => {
        const resultText = formatResultForTextarea();
        navigator.clipboard.writeText(resultText)
            .then(() => alert('Report copied to clipboard!'))
            .catch(err => console.error('Error copying text: ', err));
    };

    return ( 
       <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
    <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-indigo-600 pr-3">📋 Session Report</h2>

        {/* Date and Time Inputs */}
        <div className="flex gap-6">
            <div className="flex-1">
                <label className="block font-semibold text-gray-700 mb-2">Date:</label>
                <input
                    type="text"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    placeholder="Select Date"
                    className="block w-full border rounded-lg p-3 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <div className="flex-1">
                <label className="block font-semibold text-gray-700 mb-2">Time:</label>
                <input
                    type="text"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    placeholder="Select Time"
                    className="block w-full border rounded-lg p-3 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
        </div>

        {/* Topic and Notes */}
        <div>
            <label className="block font-semibold text-gray-700 mb-2">Topic:</label>
            <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter Session Topic"
                className="block w-full border rounded-lg p-3 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>

        <div>
            <label className="block font-semibold text-gray-700 mb-2">Notes:</label>
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter Session Notes"
                rows="4"
                className="block w-full border rounded-lg p-3 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>

        {/* TLDV Link and Report By */}
        <div className="flex gap-6">
            <div className="flex-1">
                <label className="block font-semibold text-gray-700 mb-2">TLDV Link:</label>
                <input
                    type="text"
                    value={tldvLink}
                    onChange={(e) => setTldvLink(e.target.value)}
                    placeholder="Enter TLDV Link"
                    className="block w-full border rounded-lg p-3 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <div className="flex-1">
                <label className="block font-semibold text-gray-700 mb-2">Report By:</label>
                <input
                    type="text"
                    value={reportBy}
                    onChange={(e) => setReportBy(e.target.value)}
                    placeholder="Enter Reporter's Name"
                    className="block w-full border rounded-lg p-3 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
        </div>

        {/* Search & Select Names */}
        <div>
            <label className="block font-semibold text-gray-700 mb-2">Attended with Other Batches:</label>
            <input
                type="text"
                value={searchQuery}
                onChange={handleSearchQueryChange}
                placeholder="Search names..."
                className="block w-full border rounded-lg p-3 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {suggestions.length > 0 && (
                <ul className="border rounded-lg mt-2 bg-white max-h-40 overflow-auto shadow-md">
                    {suggestions.map((name, i) => (
                        <li
                            key={i}
                            className="p-3 hover:bg-indigo-100 cursor-pointer"
                            onClick={() => handleSelectSuggestion(name)}
                        >
                            {name}
                        </li>
                    ))}
                </ul>
            )}
        </div>

        {/* Display Selected Names */}
        {attendedWithOtherBatches.length > 0 && (
            <div>
                <h4 className="font-semibold text-gray-700">Selected Attendees:</h4>
                <ul className="space-y-2">
                    {attendedWithOtherBatches.map((entry, i) => (
                        <li key={i} className="flex items-center gap-4">
                            <span className="text-gray-700">{entry.name}</span>
                            <input
                                type="text"
                                placeholder="Extra info (optional)"
                                value={entry.extra}
                                onChange={(e) => handleExtraTextChange(i, e.target.value)}
                                className="border rounded-lg p-2 text-sm text-gray-700"
                            />
                            <button
                                onClick={() => handleRemoveAttendee(i)}
                                className="text-red-600 text-xs font-semibold"
                            >
                                ❌
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        )}

        {/* Manual Input for Names */}
        <div>
            <label className="block font-semibold text-gray-700 mb-2">Meetlist Names:</label>
            <textarea
                value={namesInput}
                onChange={handleNamesInputChange}
                placeholder="Enter names, one per line"
                rows="4"
                className="block w-full border rounded-lg p-3 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>

        {/* Submit Button */}
        <button
            onClick={handleSubmit}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
            Generate Report
        </button>
    </div>

    {/* Display Report */}
    {combinedResult.attendees && (
        <div className="w-full max-w-lg mt-8 bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold text-center text-indigo-600 mb-4">Generated Report</h2>
            <textarea
                value={formatResultForTextarea()}
                readOnly
                rows="10"
                className="w-full bg-gray-100 border rounded-lg p-3 text-gray-700"
            />
            <button
                onClick={copyToClipboard}
                className="w-full py-3 mt-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
                Copy
            </button>
        </div>
    )}
</div>

    );
}
