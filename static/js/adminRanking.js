const rankingOpeners = document.querySelectorAll('.event-ranking');
const rankingModalContainer = sel('#ranking-container');
const rankingCancel = sel('#ranking-cancel');
const rankingClear = sel('#ranking-clear');

let rankingId = -1;

function disableControls() {
    rankingCancel.style.pointerEvents = 'none';
    rankingSubmit.style.pointerEvents = 'none';
    rankingClear.style.pointerEvents = 'none'
    rankingClear.disabled = true;
    rankingSubmit.disabled = true;
}

function enableControls() {
    rankingCancel.style.pointerEvents = '';
    rankingSubmit.style.pointerEvents = '';
    rankingClear.style.pointerEvents = '';
    rankingClear.disabled = false;
    rankingSubmit.disabled = false;
}

rankingClear.addEventListener('click', function() {
    disableControls();
    makeRequest('DELETE', '/admin/ranking', { rankingId }, function(res) {
        enableControls();
        rankingId = -1;
        try {
            const response = JSON.parse(res.responseText);
            if (response.success) {
                succBar(response.message);
                setTimeout(function() {
                    window.location.reload(true);
                }, 750);
            } else {
                errBar(response.message);
            }
        } catch (e) {
            errBar('There was an error');
        }
    });
})

rankingOpeners.forEach(function(r) {
    r.addEventListener('click', function() {
        showOverlay();
        rankingId = r.dataset.id;

        const ranking = r.dataset.ranking.split(',').map(function(n) { return parseInt(n) })
        const points = r.dataset.points.split(',').map(function(n) { return parseInt(n); });
        populateRankingModal(ranking, points)

        rankingModalContainer.classList.remove('hidden');
    })
})

rankingCancel.addEventListener('click', function() {
    hideOverlay();
    rankingModalContainer.classList.add('hidden');

    clearRankingInput()
});

const rankingSubmit = sel('#ranking-submit');

const firstPlace = sel('#ranking-first');
const firstPoints = sel('#ranking-first-points');

const secondPlace = sel('#ranking-second');
const secondPoints = sel('#ranking-second-points');

const thirdPlace = sel('#ranking-third');
const thirdPoints = sel('#ranking-third-points');

const fourthPlace = sel('#ranking-fourth');
const fourthPoints = sel('#ranking-fourth-points');

rankingSubmit.addEventListener('click', function() {
    disableControls();

    const rankingData = {
        rankingId,
        ranking: [
            firstPlace.options[firstPlace.selectedIndex].value,
            secondPlace.options[secondPlace.selectedIndex].value,
            thirdPlace.options[thirdPlace.selectedIndex].value,
            fourthPlace.options[fourthPlace.selectedIndex].value,
        ],
        points: [firstPoints.value, secondPoints.value, thirdPoints.value, fourthPoints.value],
    };

    console.log(rankingData)

    makeRequest('POST', '/admin/ranking', rankingData, function(res) {
        enableControls();

        try {
            const response = JSON.parse(res.responseText);
            if (response.success) {
                succBar(response.message);
                setTimeout(function() {
                    window.location.reload(true);
                }, 750);
            } else {
                errBar(response.message);
            }
        } catch (e) {
            errBar('There was an error');
        }
    });
});

function clearRankingInput() {
    firstPoints.value = ""
    secondPoints.value = ""
    thirdPoints.value = ""
    fourthPoints.value = ""

    firstPlace.selectedIndex = 0
    secondPlace.selectedIndex = 0
    thirdPlace.selectedIndex = 0
    fourthPlace.selectedIndex = 0
}

function populateRankingModal(ranking, points) {
    firstPoints.value = points[0]
    secondPoints.value = points[1]
    thirdPoints.value = points[2]
    fourthPoints.value = points[3]

    firstPlace.value = ranking[0]
    secondPlace.value = ranking[1]
    thirdPlace.value = ranking[2]
    fourthPlace.value = ranking[3]
}