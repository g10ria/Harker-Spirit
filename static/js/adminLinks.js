const linksOpeners = document.querySelectorAll('.event-links');
const linksModalContainer = sel('#links-container');
const linksCancel = sel('#links-cancel');

let linksId = -1;
let classes
let links
let names

function disableControls() {
    linksCancel.style.pointerEvents = 'none';
    linksSubmit.style.pointerEvents = 'none';
    linksSubmit.disabled = true;
}

function enableControls() {
    linksCancel.style.pointerEvents = '';
    linksSubmit.style.pointerEvents = '';
    linksSubmit.disabled = false;
}

linksOpeners.forEach(function(l) {
    l.addEventListener('click', function() {
        showOverlay();
        linksId = l.dataset.id;

        links = l.dataset.links.split(',')
        names = l.dataset.names.split(',')
        classes = l.dataset.classes.split(',').map(function(c) {
            if (c == 0) return 'global'
            return c
        })

        if (!links[0]) {
            links = []
            names = []
            classes = []
        }

        populateLinksModal();

        linksModalContainer.classList.remove('hidden');
    });
});

linksCancel.addEventListener('click', function() {
    hideOverlay();
    linksModalContainer.classList.add('hidden');

    linksId = -1
    classes = undefined
    links = undefined
    names = undefined

    clearAddLinkInput();
});

const linksSubmit = sel('#links-submit');

linksSubmit.addEventListener('click', function() {
    disableControls();

    let parsedLinks = []
    for (let i = 0; i < classes.length; i++) {
        parsedLinks.push({
            link: links[i],
            name: names[i],
            class: classes[i],
        });
    }

    const linksData = {
        linksId,
        links: parsedLinks,
    };

    makeRequest('POST', '/admin/links', linksData, function(res) {
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
            setTimeout(function() {
                window.location.reload(true);
            }, 750);
        }
    });
});

// for adding a new links
const linksClass = sel('#links-class')
const linksName = sel('#links-name')
const linksURL = sel('#links-url')

const linksAdd = sel('#links-add-button');

linksAdd.addEventListener('click', function() {
    const name = linksName.value
    const link = linksURL.value
    const classStr = linksClass.options[linksClass.selectedIndex].value;

    if (!classStr) {
        errBar("Please select a class")
    } else if (name.length == 0) {
        errBar("Please enter a link name")
    } else if (!validURL(link)) {
        errBar("Please enter a valid URL")
    } else {
        names.push(name);
        links.push(link);
        classes.push(classStr);

        clearAddLinkInput();

        populateLinksModal();
    }
})

function clearAddLinkInput() {
    linksName.value = '';
    linksURL.value = '';
    linksClass.selectedIndex = 0;
}

function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

const linkTable = sel('#links-table');

function populateLinksModal() {
    linkTable.innerHTML = `<tr>
                    <th>Class</th>
                    <th>Link</th>
                    <th></th>
                </tr>`;

    for (let i = 0; i < classes.length; i++) {
        const row = cr('tr')
        const classCol = cr('td')
        const linkCol = cr('td')
        const linkColCont = cr('a')
        const delCol = cr('td')

        classCol.innerHTML = classes[i]
        linkColCont.target = "_blank"
        linkColCont.href = links[i]
        linkColCont.innerHTML = names[i]
        linkCol.appendChild(linkColCont)
        delCol.classList.add('link-delete')
        delCol.addEventListener('click', function() { deleteLink(delCol.parentNode.rowIndex) })
        delCol.innerHTML = 'Delete'

        row.appendChild(classCol)
        row.appendChild(linkCol)
        row.appendChild(delCol)

        linkTable.appendChild(row)
    }
}

function deleteLink(index) {
    classes.splice(index - 1, 1)
    names.splice(index - 1, 1);
    links.splice(index - 1, 1);

    populateLinksModal()
}