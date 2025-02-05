import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import arrow from "./assets/home2.png";
import { inspiringQuotes, cautionaryQuotes } from "./assets/quotes.js";


const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString("en-GB").split("/").join("-"); // DD-MM-YYYY format
};

export default function AudioTaskReport() {
    const [audioTaskDate, setAudioTaskDate] = useState(getCurrentDate());
    const [taskDescription, setTaskDescription] = useState("");
    const [notes, setNotes] = useState("");
    const [reportBy, setReportBy] = useState(""); // New state for report by
    const [loading, setLoading] = useState(false);
    const [batchList, setBatchList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedNames, setSelectedNames] = useState([]);
    const [report, setReport] = useState(""); // State to hold the generated report
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBatchList = async () => {
            try {
                const response = await axios.get("https://session-report.onrender.com/names");
                setBatchList(response.data || []);
            } catch (error) {
                console.error("Error fetching names:", error);
                setBatchList([]);
            }
        };
        fetchBatchList();
    }, []);

    const handleHomeClick = () => navigate("/");

    const handleNameSelection = (name) => {
        if (!selectedNames.includes(name)) {
            setSelectedNames([...selectedNames, name]);
        }
        setSearchTerm(""); // Clear search after selection
    };

    const handleRemoveSelected = (name) => {
        setSelectedNames(selectedNames.filter((n) => n !== name));
    };

    const handleInspireClick = () => {
        const randomIndex = Math.floor(Math.random() * inspiringQuotes.length);
        setNotes(inspiringQuotes[randomIndex]); // Set random inspiring quote to notes
    };

    const handleCautionClick = () => {
        const randomIndex = Math.floor(Math.random() * cautionaryQuotes.length);
        setNotes(cautionaryQuotes[randomIndex]); // Set random cautionary quote to notes
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const notSubmitted = batchList.filter(name => !selectedNames.includes(name));

        const submittedReport = selectedNames.length > 0 ? `${selectedNames.map(name => `🔹${name}`).join('\n')}` : "No participants submitted.";
        const notSubmittedReport = notSubmitted.length > 0 ? `${notSubmitted.map(name => `${name}`).join('\n')}` : "No participants not submitted.";

        const fullReport = `Audio Task report 🚨🚨
    
Batch: BCR 56/57
🗓 Date: ${audioTaskDate}
    
🧑🏻‍🏫 Trainer: Afzal Nazar
🧑🏻‍💻🧑🏻‍💻 Coordinators: Karthikeyan k & Nazil zaman kp
    
🎤 Task: ${taskDescription} 
    
Submission Status:

🟢 Submitted:

${submittedReport}

🚩 Not Submitted:

${notSubmittedReport}
    
📄 Report Submitted By: ${reportBy}

--------------------------------------

${notes}
        `;

        try {
            setLoading(true);
            await axios.post("https://session-report.onrender.com/audio-task", {
                audioTaskDate,
                taskDescription,
                notes,
                submittedNames: selectedNames.length > 0 ? selectedNames.sort() : [],
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

            setTaskDescription(""); // Clear task description after submission
            setNotes(""); // Clear notes
            setSelectedNames([]); // Clear selected names
            setReport(fullReport); // Store the generated report in state for rendering

        } catch (error) {
            console.error("Submission Error:", error.response?.data || error.message);
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.error || "Something went wrong!",
                icon: "error",
                confirmButtonText: "OK",
            });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        const resultText = report;
        navigator.clipboard.writeText(resultText)
            .then(() => alert('Report copied to clipboard!'))
            .catch(err => console.error('Error copying text: ', err));
    };




    return (
        <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center">
               <div className="min-h-screen flex flex-col items-center bg-gray-900 p-6">
            <div className="w-full max-w-lg bg-gray-800 shadow-lg rounded-lg p-8 space-y-6">
                    <img src={arrow} className="h-8 text-left cursor-pointer" onClick={handleHomeClick} alt="Back" />
                <h2 className="text-3xl font-bold text-center text-white">🎧 Audio Task Report</h2>
    
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Date and Report By Section */}
                    <div className="flex gap-6">
                        <div className="flex-1">
                            <label className="block font-semibold text-gray-700 mb-2"></label>
                            <input
                                type="text"
                                value={audioTaskDate}
                                onChange={(e) => setAudioTaskDate(e.target.value)}
                                className="block w-full  bg-gray-900 border border-gray-800  text-gray-300 rounded-lg p-3 shadow-sm focus:outline-none focus:ring-1 focus:ring-white"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block font-semibold text-gray-700 mb-2"></label>
                            <input
                                type="text"
                                value={reportBy}
                                onChange={(e) => setReportBy(e.target.value)}
                                placeholder="Report By:"
                                className="block w-full  bg-gray-900 border border-gray-800  text-gray-300 rounded-lg p-3 shadow-sm focus:outline-none focus:ring-1 focus:ring-white"
                            />
                        </div>
                    </div>
    
                    {/* Task Description */}
                    <div>
                        <label className="block font-semibold text-gray-700 mb-2"></label>
                        <textarea
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            placeholder="Audio Task Title"
                            rows="4"
                           className="block w-full  bg-gray-900 border border-gray-800  text-gray-300 rounded-lg p-3 shadow-sm focus:outline-none focus:ring-1 focus:ring-white"
                        />
                    </div>
    
                    {/* Search & Select Participants */}
                    <div>
                        <label className="block font-semibold text-gray-700 mb-2"></label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Names of People Who Submitted..."
                            className="block w-full  bg-gray-900 border border-gray-800  text-gray-300 rounded-lg p-3 shadow-sm focus:outline-none focus:ring-1 focus:ring-white"
                        />
                        {searchTerm && (
                            <ul className=" bg-gray-400 border border-gray-800 rounded-lg mt-2 shadow-sm max-h-40 overflow-y-auto">
                                {batchList
                                    .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedNames.includes(name))
                                    .map((name, index) => (
                                        <li
                                            key={index}
                                            onClick={() => handleNameSelection(name)}
                                            className="p-2 cursor-pointer hover:bg-indigo-200"
                                        >
                                            {name}
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </div>
    
                    {/* Selected Participants */}
                    
                        
                        {selectedNames.length > 0 && <div>
                        <h3 className="font-semibold text-gray-300 mb-2">Selected Names:</h3>
                            <ul className=" bg-gray-900 border border-gray-800  text-gray-300 rounded-lg p-3 shadow-sm">
                                {selectedNames.map((name, index) => (
                                    <li key={index} className="flex justify-between items-center p-2">
                                        {name}
                                        <button
                                        type="button"
                                            onClick={() => handleRemoveSelected(name)}
                                            className="text-red-500 text-sm"
                                        >
                                            ❌
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            </div>
                        }
        
                    {/* Notes Section */}
                    <div>
                        <label className="block font-semibold text-gray-700 mb-2"></label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Appreciate or Remind?"
                            rows="4"
                            className="block w-full  bg-gray-900 border border-gray-800  text-gray-300 rounded-lg p-3 shadow-sm focus:outline-none focus:ring-1 focus:ring-white"
                        />
                    </div>
    
                    {/* Inspire and Caution Buttons */}
                    <div className="flex justify-between space-x-4 pb-10">
                        <button
                            type="button"
                            onClick={handleInspireClick}
                            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-indigo-500"
                        >
                            Pinne Potti!
                        </button>
                        <button
                            type="button"
                            onClick={handleCautionClick}
                            className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-indigo-500"
                        >
                            Ivde Noku!
                        </button>
                        <button
                            type="submit"
                            className={`px-6 py-3 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "Generate"}
                        </button>
                    </div>
    
                    {/* Submit Button */}
                    <div className="text-center mt-4">
                       
                    </div>
                </form>
    
                {/* Display Generated Report */}
                {report && (
                    <div>
                        <label className="block text-xl font-semibold text-white mb-2 text-center">Generated Report:</label>
                        <textarea
                            value={report}
                            onChange={(e)=>setReport(e.target.value)}
                            rows="12"
                            className="block  bg-gray-900 border border-gray-800  text-gray-300 w-full rounded-lg p-3 shadow-sm focus:ring-1 focus:ring-white scrollbar-hide"
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
        </div>
        </div>
     
    );
    
}
