/**
 * @param {SubmitEvent} eventForm
 */
function GetPrice(eventForm) {
    eventForm.preventDefault();
    const params = new FormData(eventForm.target);
    const urlEncodedData = new URLSearchParams();
    for (const pair of params) {
        urlEncodedData.append(pair[0], pair[1]);
    }

    fetch('/api/stock-prices?' + urlEncodedData.toString(), {
        method: 'GET',
    })
        .then((data) => data.json())
        .then((data) => {
            // eslint-disable-next-line no-undef
            const jsonResult = document.getElementById('jsonResult');
            if (jsonResult) {
                jsonResult.textContent = JSON.stringify(data);
            }
        })
        .catch((ex) => console.error(ex));
    return false;
}

// eslint-disable-next-line no-undef
const testForm = document.getElementById('testForm');
testForm.addEventListener('submit', GetPrice);

// eslint-disable-next-line no-undef
const testForm2 = document.getElementById('testForm2');
testForm2.addEventListener('submit', GetPrice);
