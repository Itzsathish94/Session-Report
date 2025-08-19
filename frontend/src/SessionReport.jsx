import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import arrow from './assets/home2.png';
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";



// Get the current date 
const getCurrentDate = () => {
    const date = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
};

export default function App() {
    const [namesInput, setNamesInput] = useState("");
    const [attendanceInput, setAttendanceInput] = useState([]);
    const [file, setFile] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [attendedWithOtherBatches, setAttendedWithOtherBatches] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [jsonNames, setJsonNames] = useState([]);  // JSON names list
    const [attendees, setAttendees] = useState([]);
    const [absentees, setAbsentees] = useState([]);
    const [combinedResult, setCombinedResult] = useState("");  // Combined result
    const [selectedDate, setSelectedDate] = useState(getCurrentDate());
    const [selectedTime, setSelectedTime] = useState("04:30 PM - 05:30 PM");
    const [topic, setTopic] = useState("");
    const [tldvLink, setTldvLink] = useState("");
    const [reportBy, setReportBy] = useState("");
    const [notes, setNotes] = useState("");
    const [text, setText] = useState("");
    const reportRef = useRef(null);
    const [csvAlertMessage, setCsvAlertMessage] = useState(null);
    const [fadeOut, setFadeOut] = useState(false);
    const [copyMessage, setCopyMessage] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
        (window.location.hostname === "localhost"
            ? "http://localhost:5000"
            : "https://session-report.onrender.com");



    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            handleUpload(file);
            setFile(file) // Automatically upload when a file is selected
        }
    };

    // Upload CSV & Fetch Extracted Names
    const handleUpload = async (file) => {
        if (!file) {
            return alert("Please select a CSV file first!");
        }

        const formData = new FormData();
        formData.append("attendanceFile", file);

        try {
            //"http://localhost:5000/api/user/upload-attendance","https://session-report.onrender.com/api/user/upload-attendance"
            const { data } = await axios.post(`${API_BASE_URL}/api/user/upload-attendance`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setAttendanceInput(data.attendanceInput); // Set extracted names
            console.log("Updated attendanceInput:", data.attendanceInput);

            setSuccessMessage("✔️ File uploaded!");
            setTimeout(() => {
                setSuccessMessage("");
            }, 2000);

            console.log("Extracted Names:", data.attendanceInput);
        } catch (error) {
            console.error("Error uploading CSV:", error.response || error.message);
        }
    };

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/user/names`) //"http://localhost:5000/api/user/names","https://session-report.onrender.com/api/user/names"
            .then(response => {
                setJsonNames(response.data);
            })
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
        if (attendedWithOtherBatches.some(item => item.name === name)) return;

        setAttendedWithOtherBatches(prev => [...prev, { name, extra: "" }]);
        setJsonNames(prev => prev.filter(item => item !== name));

        setSearchQuery("");
        setSuggestions([]);
    };

    const handleExtraTextChange = (index, value) => {
        setAttendedWithOtherBatches(prev => {
            const updated = [...prev];
            updated[index].extra = value ? `Attended with ${value}` : '';;
            return updated;
        });
    };

    const handleRemoveAttendee = (index) => {
        const removedName = attendedWithOtherBatches[index].name;
        setAttendedWithOtherBatches(prev => prev.filter((_, i) => i !== index));
        setJsonNames(prev => [...prev, removedName]);
    };

    const navigate = useNavigate();

    const handleHomeClick = () => {
        navigate("/");
    };

    useEffect(() => {
        console.log("Updated Attendance Input:", attendanceInput);
    }, [attendanceInput]); // This runs when attendanceInput changes

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate input
        if (!file || (attendanceInput.length === 0 && attendedWithOtherBatches.length === 0)) {
            setCsvAlertMessage("Please upload a Meetlist CSV 🤷‍♂️!");
            setFadeOut(false);
            setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => setCsvAlertMessage(null), 1000);
            }, 2000);
            return;
        }

        try {
            //"https://session-report.onrender.com/api/user/update-attendance","http://localhost:5000/api/user/update-attendance"
            const { data } = await axios.post(`${API_BASE_URL}/api/user/update-attendance`, {
                names: jsonNames,
                attendedWithOtherBatches,
                attendanceInput
            });


            if (data && Array.isArray(data.attendees) && Array.isArray(data.absentees)) {
                setAttendees(data.attendees.sort());
                setAbsentees(data.absentees.sort());

                // Ensuring state updates before scrolling
                setCombinedResult({ attendees: data.attendees, absentees: data.absentees });

                // Scroll to report after state updates
                setTimeout(() => {
                    reportRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 200);


                Swal.fire({
                    title: `🎉🎉 Congrats! 🎉🎉`,
                    text: 'You are officially Lazy!',
                    width: 400,
                    padding: "1em",
                    color: "#000",
                    background: "#fff url(/cloud.jpg)",
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



    // Format the result for textarea
    const formatResultForTextarea = () => {
        const attendeesText = attendees.map(name => `${name}`).join("\n");
        const absenteesText = absentees.map(name => `${name}`).join("\n");

        return `Session Report
➖➖➖➖➖➖➖➖
👥 BCR56/57
📆 ${selectedDate}
🕒 ${selectedTime}

Communication Trainer:
🧑🏻‍🏫 Rohaan N Devasia

Coordinators:
🧑🏻‍💻 🧑🏻‍💻 Sathish Kumar

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

    const copyToClipboard = () => {
        const resultText = formatResultForTextarea();
        navigator.clipboard.writeText(resultText)
            .then(() => {
                setCopyMessage("📒 Copied to clipboard!");
                setFadeOut(false);
                setTimeout(() => {
                    setFadeOut(true);
                    setTimeout(() => setCopyMessage(null), 500);
                }, 2000);
            })
            .catch(err => console.error('Error copying text: ', err));
    };

    return (
        <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center">
            <div className="min-h-screen flex flex-col items-center bg-gray-900 p-6">
                <div className="w-full max-w-lg bg-gray-800 shadow-lg rounded-lg p-8 space-y-6">
                    <img src={arrow} className="h-8 text-left cursor-pointer" onClick={handleHomeClick} alt="Back" />
                    <h2 className="text-3xl font-bold text-center text-white pr-3 pb-5">📋 Session Report</h2>

                    {/* Date and Time Inputs */}
                    <div className="flex gap-6">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                placeholder="Select Date"
                                className="block w-full border  border-gray-800  rounded-lg p-3 text-gray-300 bg-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                            />
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                placeholder="Select Time"
                                className="block w-full border  border-gray-800  rounded-lg p-3 text-gray-300 bg-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                            />
                        </div>
                    </div>

                    {/* Topic and Notes */}
                    <div>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Session Topic"
                            className="block w-full border  border-gray-800  rounded-lg p-3 text-gray-300 bg-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-white"
                        />
                    </div>

                    <div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Session Notes"
                            rows="4"
                            className="block  border-gray-800  w-full border rounded-lg p-3 text-gray-300 bg-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-white"
                        />
                    </div>



                    {/* Search & Select Names */}
                    <div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchQueryChange}
                            placeholder="Attended With Other Session"
                            className="block w-full border  border-gray-800  rounded-lg p-3 text-gray-300 bg-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-white"
                        />
                        {suggestions.length > 0 && (
                            <ul className="border  border-gray-800  rounded-lg mt-2 bg-gray-400 max-h-40 overflow-auto shadow-md">
                                {suggestions.map((name, i) => (
                                    <li
                                        key={i}
                                        className="p-3 hover:bg-indigo-200 cursor-pointer"
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
        <h4 className="font-semibold text-gray-300 pb-2 pl-1">Selected Names:</h4>
        <ul className="bg-gray-900 border border-gray-800 text-gray-300 rounded-lg p-3 shadow-sm space-y-1 sm:space-y-2">
            {attendedWithOtherBatches.map((entry, i) => (
                <li key={i} className="flex justify-between items-center gap-2 sm:gap-4">
                    <span className="text-white truncate">{entry.name}</span>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <input
                            type="text"
                            placeholder="Session?"
                            value={entry.extra.replace(/^Attended with /, '')}
                            onChange={(e) => handleExtraTextChange(i, e.target.value)}
                            className="border border-gray-800 rounded-lg p-1 text-sm text-gray-300 bg-gray-900 w-16 sm:w-auto text-center"
                        />
                        <button
                            onClick={() => handleRemoveAttendee(i)}
                            className="text-red-600 text-xs font-semibold"
                        >
                            ❌
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    </div>
)}
    

                    <div className="flex flex-wrap items-center justify-center sm:justify-between w-full border border-gray-800 rounded-lg p-3 bg-gray-900 gap-2 sm:gap-4 text-center sm:text-left">

                        {/* Show "Attended session with BCR 56/57" initially, then replace with uploaded file name */}
                        <p className="text-gray-300 text-sm font-semibold">
                            {file ? (
                                <>
                                    Uploaded: <span className="text-indigo-400 font-bold">{file.name.slice(0, 16)}</span>
                                </>
                            ) : (
                                <>
                                    Attended session with <span className="text-indigo-400 font-bold">BCR 56/57</span>
                                </>
                            )}
                        </p>


                        {/* Upload button remains in the same position */}
                        <div className="w-full sm:w-auto flex justify-center">
                            <label
                                htmlFor="file-upload"
                                className={`cursor-pointer px-4 py-2 text-white text-sm font-medium rounded-lg shadow-md transition-all 
                ${file ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {file ? "✔️ File Uploaded" : "Upload CSV"}
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>

                    </div>


                    {successMessage && (
                        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 w-72 sm:w-64 md:w-80 p-4 sm:p-3 bg-green-500 text-white rounded-lg shadow-xl text-center transition-opacity opacity-100 animate-fadeIn">
                            <span className="font-semibold text-sm sm:text-base md:text-lg">{successMessage}</span>
                        </div>
                    )}

                    {/* Manual Input for Names */}
                    {/* <div>
                        <textarea
                            value={namesInput}
                            onChange={handleNamesInputChange}
                            placeholder="Names of People Who Attended BCR 56/57 Session"
                            rows="4"
                            className="block w-full border   border-gray-800  rounded-lg p-3 text-gray-300 bg-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-white"
                        />
                    </div> */}

                    {/* CSV upload alert message */}
                    {csvAlertMessage && (
                        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-72 sm:w-64 md:w-80 p-4 sm:p-3 bg-red-500 text-white rounded-lg shadow-xl text-center opacity-100 transition-opacity animate-fadeIn">
                            <span className="font-semibold text-sm sm:text-base md:text-lg">{csvAlertMessage}</span>
                        </div>
                    )}

                    {/* TLDV Link and Report By */}

                    <div className="flex gap-6">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={tldvLink}
                                onChange={(e) => setTldvLink(e.target.value)}
                                placeholder="TLDV Link"
                                className="block w-full border border-gray-800 rounded-lg p-3 text-gray-300 bg-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-white  "
                            />
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                value={reportBy}
                                onChange={(e) => setReportBy(e.target.value)}
                                placeholder="Report By:"
                                className="block w-full border  border-gray-800  rounded-lg p-3 text-gray-300 bg-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-white"
                            />
                        </div>
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
                    <div ref={reportRef} className="w-full max-w-lg mt-8 bg-gray-900 shadow-lg rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-center text-white mb-4">Generated Report</h2>
                        <textarea
                            value={text ? text : setText(formatResultForTextarea())}
                            onChange={(e) => setText(e.target.value)}
                            rows="10"
                            className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-gray-300 scrollbar-hide"
                        />

                        {/* Copy to clipboard success message */}
                        {copyMessage && (
                            <div className={`fixed top-0 left-1/2 transform -translate-x-1/2 w-72 sm:w-64 md:w-80 p-4 sm:p-3 bg-green-500 text-white rounded-lg shadow-xl text-center ${fadeOut ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
                                <span className="font-semibold text-sm sm:text-base md:text-lg">{copyMessage}</span>
                            </div>
                        )}
                        <button
                            onClick={copyToClipboard}
                            className="w-full py-3 mt-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Copy
                        </button>
                    </div>
                )}
            </div>
        </div>

    );

}