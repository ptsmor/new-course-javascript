import { formTemplate } from './templates';
import './yandex.html'
import './main.css'
let clusterer

document.addEventListener('DOMContentLoaded', () => ymaps.ready(init))

function init(){
    // Создание карты.
    const myMap = new ymaps.Map("map", {
        // Координаты центра карты.
        // Порядок по умолчанию: «широта, долгота».
        // Чтобы не определять координаты центра карты вручную,
        // воспользуйтесь инструментом Определение координат.
        center: [59.12935368007536,37.85326163220217],
        controls: ['zoomControl'],
        // Уровень масштабирования. Допустимые значения:
        // от 0 (весь мир) до 19.
        zoom: 12
    });

    myMap.events.add('click', function(e) {
        const coords = e.get('coords')

        openBalloon(myMap, coords, [])
    })

    clusterer = new ymaps.Clusterer({clusterDisableClickZoom: true})
    clusterer.options.set('hasBalloon', false)
    renderGeoObjects(myMap)

    clusterer.events.add('click', function(e) {
        let geoObjectsInCluster = e.get('target').getGeoObjects()
        openBalloon(myMap, e.get('coords'), geoObjectsInCluster)
    })
}

function getReviewsFromLS() {
    const reviews = localStorage.reviews
    return JSON.parse(reviews || '[]')
}

function getReviewList(currentGeoObjects) {
    let getReviewListHTML = ''

    for (const review of getReviewsFromLS()) {
     if (currentGeoObjects.some(geoObject => JSON.stringify(geoObject.geometry._coordinates) === JSON.stringify(review.coords))) {
        getReviewListHTML += `
        <div class="review">
             <div><strong> ${review.autor} </strong>
             <span style="color:#8F8F8F">${review.place}</span>
             </div>
             <div style="color:#8F8F8F">${review.textReview}</div>

        </div>
        `
     }  
    }
    return getReviewListHTML
}

function renderGeoObjects(map) {
const geoObjects = []

for (const review of getReviewsFromLS()) {
    const placemark = new ymaps.Placemark(review.coords)
    placemark.events.add('click', e=> {
        e.stopPropagation()
        openBalloon(map, e.get('coords'), [e.get('target')])
    })
    geoObjects.push(placemark)
}

clusterer.removeAll()
map.geoObjects.remove(clusterer)
clusterer.add(geoObjects)
map.geoObjects.add(clusterer)
}

async function openBalloon(map, coords, currentGeoObjects) {
    await map.balloon.open(coords, {
        content: `<div class="reviews">${getReviewList(currentGeoObjects)}</div>` + formTemplate
    })

    document.querySelector('#add-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const review = {
            coords,
            autor: this.elements.autor.value,
            place: this.elements.place.value,
            textReview: this.elements.textReview.value,
        }

        localStorage.reviews = JSON.stringify([...getReviewsFromLS(), review])

        renderGeoObjects(map)

        map.balloon.close()
    })
}