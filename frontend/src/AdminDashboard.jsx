import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mrbean from '/mrbean.png'
import axios from "axios";

const AdminDashboard = () => {
  const [names, setNames] = useState([]);
  const [newName, setNewName] = useState('');
  const [bwStatus, setBwStatus] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [editName, setEditName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [coordinators, setCoordinators] = useState([]);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const [currentNames, setCurrentNames] = useState([]);
  const [loading, setLoading] = useState(null);
  const namesRef = useRef(names);
  const [indexOfFirstItem, setIndexOfFirstItem] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [nameToDelete, setNameToDelete] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://session-report.onrender.com");

  useEffect(() => {
    const message = localStorage.getItem('loginSuccessMessage');
    if (message) {
      setSuccessMessage(message);
      // Clear the message after displaying to avoid it appearing again if the user navigates back
      localStorage.removeItem('loginSuccessMessage');
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000)
    }
  }, []);

  useEffect(() => {
    namesRef.current = names;
    console.log("Names ref updated:", namesRef.current);
  }, [names]);

  useEffect(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const newIndexOfFirstItem = indexOfLastItem - itemsPerPage;

    if (newIndexOfFirstItem !== indexOfFirstItem) {
      setIndexOfFirstItem(newIndexOfFirstItem);
    }

    const newCurrentNames = names.slice(newIndexOfFirstItem, indexOfLastItem);
    if (JSON.stringify(newCurrentNames) !== JSON.stringify(currentNames)) {
      setCurrentNames(newCurrentNames);
    }
  }, [names, currentPage]);

  useEffect(() => {
    fetchNames();
  }, []); // Empty dependency array ensures this runs only once



  const fetchNames = async () => {
    try {
    
      //"https://session-report.onrender.com/api/admin/names","http://localhost:5000/api/admin/names"
      const response = await axios.get(`${API_BASE_URL}/api/admin/names`, { withCredentials: true });
      const data = response.data;

      console.log("Raw API Response:", data);

      const namesList = Array.isArray(data) ? data : data.names;
      if (!Array.isArray(namesList)) {
        console.error("Invalid API response format: Expected an array.", data);
        return;
      }

      setNames([...namesList]); // Spread operator forces a re-render
    } catch (error) {
      console.error("Error fetching names:", error);
    }
  };


  const addName = async () => {
    if (newName.trim() === '') return;

    setLoading(true);

    try {
      
      // Make API call to save the name //"https://session-report.onrender.com/api/admin/names","http://localhost:5000/api/admin/names"
      const response = await axios.post(`${API_BASE_URL}/api/admin/names`, { name: newName }, { withCredentials: true });

      console.log('Successfully added name:', response.data);

      // Ensure response contains updated names list, otherwise manually fetch
      if (response.data.names) {
        setNames(response.data.names); // Directly update state with new list
      } else {
        await fetchNames(); // Fetch updated names from the backend
      }

      setNewName(''); // Clear the input field
      setSuccessMessage('✔️ Name added!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to add name:', error.response || error);
    } finally {
      setLoading(false);
    }
  };

  const deleteName = (index) => {
    // Store the name to delete and open the confirmation modal
    const name = names[index];
    setNameToDelete(name);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    const index = names.indexOf(nameToDelete); // Find the index based on the name

    if (index === -1) {
      console.error("Name not found");
      return;
    }

    // Proceed with the deletion logic
    setNames((prevNames) => prevNames.filter((_, i) => i !== index));
    setCoordinators((prevCoordinators) => prevCoordinators.filter((c) => c !== nameToDelete));

    // Call backend to delete the name using Axios //`https://session-report.onrender.com/api/admin/names/${index}`,`http://localhost:5000/api/admin/names/${index}`
    axios
      .delete(`${API_BASE_URL}/api/admin/names/${index}`, { withCredentials: true })
      .then(() => {
        console.log('Name deleted successfully');
        fetchNames(); // Re-fetch names after deletion
        setSuccessMessage('Name deleted!🗑️');
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      })
      .catch((error) => {
        console.error('Error deleting name:', error);
      });

    // Close the confirmation modal after deletion
    setIsConfirmModalOpen(false);
    setNameToDelete(null);
  };

  const handleCancelDelete = () => {
    // Close the confirmation modal without deleting
    setIsConfirmModalOpen(false);
    setNameToDelete(null);
  };


  // Toggle Coordinator Function
  const toggleCoordinator = async (name) => {
    try {
      setCoordinators((prev) => {
        if (prev.includes(name)) {
          return prev.filter((c) => c !== name);
        } else if (prev.length < 2) {
          return [...prev, name];
        }
        return prev;
      });

      // After the state update, call fetchNames to reload the coordinators list from the backend
      await fetchNames();
    } catch (error) {
      console.error("Error toggling coordinator:", error);
    }
  };


  // Add coordinator to backend
  const addCoordinator = async (name) => {
    try {
     
      //`https://session-report.onrender.com/api/admin/toggle-coordinator`,"http://localhost:5000/api/admin/toggle-coordinator"
      await axios.post( `${API_BASE_URL}/api/admin/toggle-coordinator`, { name }, { withCredentials: true });
      // After adding, refresh the names list
      fetchNames();
    } catch (error) {
      console.error("Error adding coordinator:", error);
    }
  };

  // Remove coordinator from backend
  const removeCoordinator = async (name) => {
    try {
      //'https://session-report.onrender.com/api/admin/toggle-coordinator',"http://localhost:5000/api/admin/toggle-coordinator"
      await axios.post( `${API_BASE_URL}/api/admin/toggle-coordinator`, { name }, { withCredentials: true });
      // After removing, refresh the names list
      fetchNames();
    } catch (error) {
      console.error("Error removing coordinator:", error);
    }
  };

  const toggleBw = (index) => {
    // Toggle the current status of the 'bwStatus' for the given index
    const updatedBwStatus = !bwStatus[index];

    // Update the local state with the new bwStatus
    setBwStatus((prevStatus) => ({ ...prevStatus, [index]: updatedBwStatus }));

    // Get the current name for that index
    const nameToUpdate = names[index];

    // Update the backend with the new bwStatus and updated name //`https://session-report.onrender.com/api/admin/names/${index}`,`http://localhost:5000/api/admin/names/${index}`
    axios  
      .put(`${API_BASE_URL}/api/admin/names/${index}`, {
        name: nameToUpdate,
        bwStatus: updatedBwStatus, // Pass the bwStatus to the backend
      }, { withCredentials: true })
      .then((response) => {
        console.log('Name updated successfully', response.data);
        fetchNames(); // Re-fetch the names to update the list
      })
      .catch((error) => {
        console.error('Error updating name:', error);
      });
  };


  const startEditing = (index) => {
    console.log("Editing index:", index);
    setEditingIndex(index); // Set the index to start editing
    setEditName(names[index]); // Pre-fill with the existing name
  };

  const saveEdit = () => {
    console.log("Saving edit for:", editName);

    if (editName.trim() === "") {
      alert("Name cannot be empty!");
      return;
    }

    if (editingIndex !== null) {
      // Make sure to update both `names` and `currentNames`
      const updatedNames = [...names];
      updatedNames[editingIndex] = editName;
      setNames(updatedNames);
      setCurrentNames(updatedNames);  // Update currentNames to reflect changes immediately

      console.log("Updated names array:", updatedNames);

      // Update coordinator list if necessary
      const oldName = names[editingIndex];
      if (coordinators.includes(oldName)) {
        const updatedCoordinators = coordinators.map((coordinator) =>
          coordinator === oldName ? editName : coordinator
        );
        setCoordinators(updatedCoordinators);
      }

      setEditingIndex(null);
      setEditName('');

      

      // Update the backend with the new name //`https://session-report.onrender.com/api/admin/names/${editingIndex}`,`http://localhost:5000/api/admin/names/${editingIndex}`
      axios
        .put(`${API_BASE_URL}/api/admin/names/${editingIndex}`, { name: editName }, { withCredentials: true })
        .then(() => {
          console.log('Name updated successfully');
          setSuccessMessage('Name updated!📝');
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
          // Re-fetch updated names
          fetchNames();
        })
        .catch((error) => {
          console.error('Error updating name:', error);
        });
    }
  };


// Open the logout confirmation modal
const openLogoutConfirmModal = () => {
  console.log("Opening logout confirmation modal...");
  setIsLogoutModalOpen(true); // Set the modal open state to true
};

// Close the logout confirmation modal
const closeLogoutConfirmModal = () => {
  console.log("Closing logout confirmation modal...");
  setIsLogoutModalOpen(false); // Set the modal open state to false
};

// Handle the logout process after confirmation
const handleLogout = async () => {
  setLoading(true); // Set loading to true when the process begins
  try {
    console.log("Sending logout request to server...");
   
    // API call to log out //`https://session-report.onrender.com/api/admin/logout`,'http://localhost:5000/api/admin/logout'
    const response = await fetch( `${API_BASE_URL}/api/admin/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    // Check if response is successful
    if (!response.ok) {
      throw new Error('Logout failed');
    }

    console.log("Logout successful");

    // Clear local storage and redirect user
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/'); // Redirect back to home page after logout
  } catch (error) {
    console.error('Logout error:', error); // Log error if any
  } finally {
    setLoading(false); // Stop loading when the process is done
  }
};

// Handle when the user confirms the logout action
const handleConfirmLogout = () => {
  console.log("User confirmed logout");
  handleLogout(); // Proceed to the logout process
  closeLogoutConfirmModal(); // Close the modal after confirming the logout
};

// Handle when the user cancels the logout action
const handleCancelLogout = () => {
  console.log("User canceled logout");
  closeLogoutConfirmModal(); // Just close the modal without logging out
};

  return (

    <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center">
      <div className="min-h-screen bg-gray-800 text-gray-300 flex flex-col items-center p-5">

        {/* Header with Background */}
        <div
          style={{
            backgroundImage: `url(${mrbean})`,
            backgroundSize: "cover",  // Prevents cropping
            backgroundRepeat: "no-repeat",
            backgroundPosition: "top" // Keeps Mr. Bean’s face centered
          }}
          className="relative w-full min-h-[170px] sm:min-h-[250px] md:min-h-[190px] mb-1"
        >
          {/* Header Bar */}
          <div className="w-full flex justify-between items-center mb-2 p-3 bg-gray-800 rounded-sm gap-4">
            {/* Responsive Dashboard Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              Boomer Dashboard
            </h1>

            <div className="flex items-center gap-2 sm:gap-4">
            {/* Responsive Logout Button */}
            <button
              className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded"
              onClick={openLogoutConfirmModal} // Open the confirmation modal
            >
              Logout
            </button>
          </div>
          </div>

             {/* Logout Confirmation Modal */}
        {isLogoutModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center w-80">
              {/* Modal content */}
              <h2 className="text-lg font-semibold text-white mb-4">
                Are you sure you want to log out?
              </h2>
              <div className="mt-4 flex justify-between">
                <button
                  onClick={handleCancelLogout} // Cancel and close modal
                  className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLogout} // Confirm and log out
                  className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded"
                  disabled={loading} // Disable button while logout is in progress
                >
                  {loading ? 'Logging out...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

          {/* Total Students - Positioned at Bottom Right */}
          <div className="absolute bottom-2 right-4 p-2 text-gray-300 rounded-lg text-right bg-gray-800 bg-opacity-50 sm:right-6 sm:bottom-2">
            <h2 className="text-sm font-bold">
              Total Students: <span className="text-base">{names.length}</span>
            </h2>
          </div>
        </div>

        {successMessage && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-72 sm:w-64 md:w-80 p-4 sm:p-3 bg-green-500 text-white rounded-lg shadow-xl text-center transition-opacity opacity-100 animate-fadeIn">
            <span className="font-semibold text-sm sm:text-base md:text-lg">{successMessage}</span>
          </div>
        )}


        {/* Name Management */}
        <div className="w-full max-w-3xl">
          <div className="mb-1 flex flex-col sm:flex-row gap-1">
            <input
              type="text"
              className="flex-1 p-2 border border-gray-300 rounded text-black"
              placeholder="Enter new name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded" onClick={addName}>Add</button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">

            {currentNames.length > 0 ? (<table className="w-full border-collapse border border-gray-700 text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-700 p-2">#</th>
                  <th className="border border-gray-700 p-2">Name</th>
                  <th className="border border-gray-700 p-2">BW</th>
                  <th className="border border-gray-700 p-2">⚙️</th>
                </tr>
              </thead>
              <tbody>
                {currentNames.map((name, index) => {
                  const actualIndex = indexOfFirstItem + index;
                  return (
                    <tr key={actualIndex} className="text-center bg-gray-800 hover:bg-gray-700 transition">
                      <td className="border border-gray-700 p-2">{actualIndex + 1}</td>
                      <td className="border border-gray-700 p-2 cursor-pointer"
                        onClick={(e) => {
                          if (editingIndex === actualIndex) return; // Prevent toggle when editing
                          toggleCoordinator(name);
                        }}>
                        {editingIndex === actualIndex ? (
                          <input
                            type="text"
                            className="p-1 text-black"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                          />
                        ) : (
                          <>
                            {coordinators.includes(name) && <strong className="text-yellow-400">C</strong>}
                            {bwStatus[actualIndex] ? `${name}` : name}
                          </>
                        )}
                      </td>
                      <td className="border border-gray-700 p-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 cursor-pointer"
                          checked={bwStatus[actualIndex] || false}
                          onChange={() => toggleBw(actualIndex)}
                        />
                      </td>
                      <td className="border border-gray-700 p-2 flex justify-center gap-2">
                        {editingIndex === actualIndex ? (
                          <button className="bg-green-500 bg-opacity-10 hover:bg-green-700 text-white px-2 py-1 rounded" onClick={saveEdit}>💾</button>
                        ) : (
                          <button className="bg-yellow-500 bg-opacity-10 hover:bg-yellow-700 text-white px-2 py-1 rounded" onClick={() => startEditing(actualIndex)}>✏️</button>
                        )}
                        <button
                          className="bg-red-500 bg-opacity-10 hover:bg-red-700 text-white px-2 py-1 rounded"
                          onClick={() => deleteName(actualIndex)} // This will trigger the confirmation before deletion
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>) : (<p>Loading names...</p>)}

          </div>

           {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center w-80">
            <h2 className="text-lg font-semibold text-white mb-4">Are you sure you want to delete this name?</h2>
            <p className="text-white mb-4">{nameToDelete}</p>
            <div className="mt-4 flex justify-between">
              <button
                onClick={handleCancelDelete}
                className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
          {/* Pagination */}
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: Math.ceil(names.length / itemsPerPage) }, (_, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>


  );
};

export default AdminDashboard;


