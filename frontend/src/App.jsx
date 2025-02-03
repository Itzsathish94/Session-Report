import { useState, useEffect } from "react";
import axios from "axios";

export default function App() {
    const [namesInput, setNamesInput] = useState("");
    const [attendedWithOtherBatches, setAttendedWithOtherBatches] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [jsonNames, setJsonNames] = useState([]);  // JSON names list
    const [attendees, setAttendees] = useState([]);
    const [absentees, setAbsentees] = useState([]);
    const [extraText, setExtraText] = useState(""); // New input field for extra info

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
            } else {
                console.error("Unexpected data structure:", data);
            }
        } catch (error) {
            console.error("Error in request:", error.response || error.message);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
            <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-bold text-center mb-4">📋 Attendance Generator</h2>

                {/* Search & Select Names */}
                <div className="mb-4">
                    <label className="block font-semibold">Attended with Other Batches:</label>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchQueryChange}
                        placeholder="Search names..."
                        className="block w-full border rounded p-2"
                    />
                    {suggestions.length > 0 && (
                        <ul className="border rounded mt-1 bg-white max-h-40 overflow-auto">
                            {suggestions.map((name, i) => (
                                <li 
                                    key={i} 
                                    className="p-2 hover:bg-gray-200 cursor-pointer"
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
                    <div className="mb-4">
                        <h4 className="font-semibold">Selected Attendees:</h4>
                        <ul>
                            {attendedWithOtherBatches.map((entry, i) => (
                                <li key={i} className="flex items-center gap-2 mb-2">
                                    <span className="text-gray-700">{entry.name}</span>
                                    <input 
                                        type="text" 
                                        placeholder="Extra info (optional)" 
                                        value={entry.extra} 
                                        onChange={(e) => handleExtraTextChange(i, e.target.value)}
                                        className="border rounded p-1 text-sm"
                                    />
                                    <button 
                                        onClick={() => handleRemoveAttendee(i)}
                                        className="text-red-600 text-xs font-bold"
                                    >
                                        ❌
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Textarea for Manual Name Entry */}
                <textarea
                    value={namesInput}
                    onChange={handleNamesInputChange}
                    placeholder="Enter names, each on a new line"
                    rows={5}
                    className="block w-full text-sm mb-2 border rounded p-2"
                />

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Submit
                </button>

                {/* Results */}
                <div className="mt-6">
                    <h3 className="text-xl font-semibold text-green-600">✅ Attendees 🙋‍♀🙋🏻‍♂ ({attendees.length}) 
                    </h3>
                    <ul className="list-disc pl-5">
                        {attendees.map((name, i) => (
                            <li key={i} className="text-gray-700">{name}</li>
                        ))}
                    </ul>

                    <h3 className="text-xl font-semibold text-red-600 mt-4">❌ Absentees 🙅🏻‍♂🙅🏻‍♀
                    ({absentees.length})</h3>
                    <ul className="list-disc pl-5">
                        {absentees.map((name, i) => (
                            <li key={i} className="text-gray-700">{name}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
