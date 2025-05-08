// Helper function to convert array of objects to CSV string
export const convertToCSV = (objArray) => {
    if (objArray.length === 0) {
      return "";
    }
   
    const headers = Object.keys(objArray[0]);
    const headerRow = headers.join(',');
   
    const rows = objArray.map(obj => {
      return headers.map(header => {
        // Escape quotes and wrap fields with commas in quotes
        let cellValue = obj[header] === null || obj[header] === undefined ? '' : obj[header].toString();
        if (cellValue.includes(',') || cellValue.includes('"') || cellValue.includes('\n')) {
          cellValue = '"' + cellValue.replace(/"/g, '""') + '"';
        }
        return cellValue;
      }).join(',');
    });
   
    return [headerRow, ...rows].join('\n');
  };
  
  // Function to load JSZip library
  export const loadJSZip = () => {
    return new Promise((resolve, reject) => {
      if (window.JSZip) {
        resolve();
        return;
      }
     
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.integrity = 'sha512-XMVd28F1oH/O71fzwBnV7HucLxVwtxf26XV8P4wPk26EDxuGZ91N8bsOttmnomcCD3CS5ZMRL50H0GgOHvegtg==';
      script.crossOrigin = 'anonymous';
      script.referrerPolicy = 'no-referrer';
     
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load JSZip library'));
     
      document.head.appendChild(script);
    });
  };
  
  // Function to fetch contact data from Firestore
  export const fetchContactsData = async (fireApp, userId) => {
    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const contactsRef = collection(fireApp, "contacts");
      const contactsQuery = query(
        contactsRef,
        where("userId", "==", userId)
      );
      const contactsSnapshot = await getDocs(contactsQuery);
     
      if (contactsSnapshot.empty) {
        return [];
      }
     
      return contactsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          // Format timestamp if it exists
          dateAdded: data.dateAdded ? new Date(data.dateAdded.seconds * 1000).toISOString() : '',
          dateUpdated: data.dateUpdated ? new Date(data.dateUpdated.seconds * 1000).toISOString() : '',
        };
      });
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return [];
    }
  };
