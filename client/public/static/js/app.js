if('serviceWorker' in navigator) {
    navigator
        .serviceWorker
        .register('/service-worker.js').then(registration => {
            console.log('Service worker registration succeeded:' , registration);
        }).catch(err => {
            console.log('Service worker registration failed:' , err);
        })
}

let installPromptEvent;

window.addEventListener('beforeinstallprompt' , (e) => {
    e.preventDefault();
    console.log('before install prompt event')
    installPromptEvent = e;
});


document.querySelector('.fixed-action-btn a').addEventListener('click' , (e) => {
    e.preventDefault();
    console.log(installPromptEvent);
    if(installPromptEvent) {
        installPromptEvent.prompt();

        installPromptEvent.userChoice
            .then((choiceResult) => {
                if(choiceResult.outcome === 'accepted') {
                    console.log('User Accepted');
                } else {
                    console.log('User dismissed');
                }

                installPromptEvent = null;
            })
    }
})

fetch('http://roocket.org/api/products')
    .then(response => response.json())
    .then(res => {
        let products = res.data.data;
        products.forEach(product => {
            createUi(product)
        })
    }).catch(err => {
        if('indexedDB' in window) {
            db.products.toArray()
                .then(products=> {
                    products.forEach(product => {
                        createUi(product)
                    })
                })
        }
    })


function createUi(product) {
    let card = `
        <div class="col s12 m4">
            <div class="card">
                <div class="card-image">
                    <img src="${product.image}">
                    <span class="card-title">${product.title}</span>
                </div>
                <div class="card-content">
                    <p>${product.body}</p>
                </div>
            </div>
        </div>
    `;

    let productsContentElemet = document.getElementById('products');
    if(productsContentElemet != undefined)
        productsContentElemet.innerHTML += card;
}