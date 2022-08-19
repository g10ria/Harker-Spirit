function selectEvent(id) {
    makeRequest('GET', `/event/${id}`, {}, function(res) {
        try {
            let response = JSON.parse(res.responseText);

            if (response.success) {
                updateSidebar(response.detailedEvent);
            } else {
                // todo: snackbar error
            }
        } catch (e) {
            console.error(e);
            console.log(res.responseText);
        }
    });
}

const sidebar = document.querySelector('#sidebar');
const sidebarLabel = document.querySelector('#sidebar-label');
const sidebarHeader = document.querySelector('#sidebar-header');

// Updates sidebar with detailed event data
function updateSidebar(detailedEvent) {
    sidebar.innerHTML = '';

    sidebar.appendChild(generateSidebarTitle(detailedEvent));
    sidebar.appendChild(generateSidebarDescription(detailedEvent));
    sidebar.appendChild(generateSidebarGlobalLinks(detailedEvent));
    console.log(detailedEvent)
    if (detailedEvent.ranking[0]) {
        for (let i = 0; i < 4; i++) {
            sidebar.appendChild(generateSidebarClass(detailedEvent, i));
        }
    } else {
        const noRank = cr('div')
        noRank.innerHTML = 'No ranking'
        sidebar.appendChild(noRank)
    }
}

// Gens the title area of the sidebar
function generateSidebarTitle(detailedEvent) {
    const t = cr('div');
    t.classList.add('row');
    t.classList.add('justifyLeft');
    t.classList.add('alignMid');
    t.id = 'sidebar-title';

    const label = cr('div');
    label.id = 'sidebar-label';
    label.style.backgroundColor = `#${detailedEvent.color}`;
    t.appendChild(label);

    const spacer1 = cr('div');
    spacer1.id = 'sidebar-titlespacer1';
    t.appendChild(spacer1);

    const header = cr('div');
    header.classList.add('header2');
    header.id = 'sidebar-header';
    header.innerHTML = detailedEvent.name;
    t.appendChild(header);

    const spacer2 = cr('div');
    spacer2.id = 'sidebar-titlespacer2';
    t.appendChild(spacer2);

    const timeframe = cr('div');
    timeframe.id = 'sidebar-timeframe';
    timeframe.innerHTML = detailedEvent.timeframe;
    t.appendChild(timeframe);

    return t;
}

// Gens just the description section
function generateSidebarDescription(detailedEvent) {
    const d = cr('div')
    d.id = 'sidebar-description'
    d.innerHTML = detailedEvent.description
    return d
}

// Gens a single class section of the sidebar
function generateSidebarClass(e, i) {
    const c = cr('div');
    c.classList.add('class');
    c.classList.add('col');

    const place = cr('div');
    place.classList.add('class-place');
    place.innerHTML = `${e.rankingStrings[i]}: ${e.ranking[i]}`;

    const points = cr('div');
    points.classList.add('class-points');
    points.innerHTML = `${e.points[i]} points`;

    c.appendChild(place);
    c.appendChild(points);

    const classLinks = e.classLinks;
    const classLinkNames = e.classLinkNames;

    if (classLinks[i].length > 0) {
        const links = cr('div');
        links.classList.add('class-links');

        classLinks[i].forEach(function(l, j) {
            const link = cr('a');
            const button = cr('button');
            button.innerHTML = classLinkNames[i][j];

            link.href = l;
            link.target = '_blank';

            link.appendChild(button);

            links.appendChild(link);
        });

        c.appendChild(links);
    }

    return c;
}

// Gens the global links section in the sidebar
function generateSidebarGlobalLinks(detailedEvent) {
    const globalLinks = detailedEvent.globalLinks;
    if (globalLinks.length == 0) return cr('div'); // dummy

    const g = cr('div');

    g.id = 'global-links';

    globalLinks.forEach(function(l, i) {
        const link = cr('a');
        const button = cr('button');
        button.innerHTML = detailedEvent.globalLinkNames[i];
        link.href = l;
        link.target = '_blank';

        link.appendChild(button);
        g.appendChild(link);
    });

    return g;
}