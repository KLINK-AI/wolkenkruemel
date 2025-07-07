// Simple API helper using XMLHttpRequest as fallback
export async function fetchApi<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.withCredentials = true;
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (e) {
            reject(new Error('Failed to parse JSON response'));
          }
        } else {
          reject(new Error(`API Error: ${xhr.status} ${xhr.statusText}`));
        }
      }
    };
    
    xhr.onerror = function() {
      reject(new Error('Network error'));
    };
    
    xhr.send();
  });
}

export async function postApi<T>(url: string, data: any): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.withCredentials = true;
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const responseData = JSON.parse(xhr.responseText);
            resolve(responseData);
          } catch (e) {
            reject(new Error('Failed to parse JSON response'));
          }
        } else {
          reject(new Error(`API Error: ${xhr.status} ${xhr.statusText}`));
        }
      }
    };
    
    xhr.onerror = function() {
      reject(new Error('Network error'));
    };
    
    xhr.send(JSON.stringify(data));
  });
}