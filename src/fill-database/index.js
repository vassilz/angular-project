'use strict';

// [START imports]
// const firebase = require('firebase-admin');

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';


// [END imports]
// [START initialize]
// Initialize the app with a service account, granting admin privileges
// const serviceAccount = require('./bookstore-8b9b8-firebase-adminsdk-service-account.json');
// firebase.initializeApp({
//   credential: firebase.credential.cert(serviceAccount),
//   databaseURL: 'https://bookstore-8b9b8-default-rtdb.europe-west1.firebasedatabase.app'
// });
// [END initialize]

// initializeApp({
//   credential: firebase.credential.cert(serviceAccount),
//   databaseURL: 'https://bookstore-8b9b8-default-rtdb.europe-west1.firebasedatabase.app'
// });
initializeApp({
  credential: applicationDefault(),
  databaseURL: 'https://bookstore-8b9b8-default-rtdb.europe-west1.firebasedatabase.app'
});

function addAuthorsToDatabase() {
    const db = getDatabase();
    const updates = {
    'authors/0': { name: 'Иван Вазов', country: 'Bulgaria', birthDate: '1850-07-09' },
    'authors/1': { name: 'Елин Пелин', country: 'Bulgaria', birthDate: '1877-07-18' },
    'authors/2': { name: 'Алеко Константинов', country: 'Bulgaria', birthDate: '1863-01-01' },
    'authors/3': { name: 'Любен Каравелов', country: 'Bulgaria', birthDate: '1834-05-02' },
    'authors/4': { name: 'J. R. R. Tolkien', country: 'UK', birthDate: '1892-01-03' },
    
    };

    db.ref().update(updates)
    .then(() => {
        console.log('Bulk update authors successful');
    })
    .catch((error) => {
        console.error('Bulk update authors failed:', error);
    });
}

function addBooksToDatabase() {
    const db = getDatabase();
    const updates = {
    'books/0': { name: 'Немили недраги', authorId: 0, pagesCount: 98, publishDate: '1883-01-01', synopsis: 'Повестта представя живота на българските емигранти (хъшове) в годините малко преди Освобождението.' },
    'books/1': { name: 'Чичовци', authorId: 0, pagesCount: 100, publishDate: '1885-01-01', synopsis: 'Централен конфликт в повестта е враждата между двама съседи – Иван Селямсъза и Варлаам Копринарката. Вместо религиозното и героичното в центъра на творбата стои битовото. Сюжетът е организиран около мотива за родовата вражда. Повестта е близка по звучене с творчеството на руския писател Николай Гогол. Това най-ярко личи в използването на похвата проблематизиране на маловажното.' },
    'books/2': { name: 'Епопея на забравените', authorId: 0, pagesCount: 100, publishDate: '1884-01-01', synopsis: '„Епопея на забравените“ е цикъл от 12 оди, подредени в съответствие с момента на създаване, написани от Иван Вазов в Пловдив в периода 1881 – 1883 г.' },
    'books/3': { name: 'Гераците', authorId: 1, pagesCount: 100, publishDate: '1911-01-01', synopsis: 'Повестта проследява разпадането на рода на семейството на богатия чорбаджия Йордан Герака след смъртта на неговата съпруга и душевен център на семейството, баба Марга. Повестта е считана за пример за реалистичното течение в началото на ХХ век, в което се описва българското село и селският бит.' },
    'books/4': { name: 'Ян Бибиян', authorId: 1, pagesCount: 100, publishDate: '1933-01-01', synopsis: 'Ян Бибиян е първият български фантастичен роман за деца от българския писател Елин Пелин. Романът се състои от две части – „Ян Бибиян. Невероятни приключения на едно хлапе“ (1933) и „Ян Бибиян на Луната" (1934).' },
    'books/5': { name: 'Бай Ганьо', authorId: 2, pagesCount: 100, publishDate: '1895-01-01', synopsis: 'Сборник с разкази за приключенията на Бай Ганьо.' },
    'books/6': { name: 'Българи от старо време', authorId: 3, pagesCount: 100, publishDate: '1872-01-01', synopsis: 'В книгата се описват основните недостатъци на българското общество, но също така се описват традиции и ценности. Основната идея на книгата е: „Няма, няма на света по-сладко нещо, отколкото да направи човек добро“.' },
    'books/7': { name: 'The Fellowship of the ring', authorId: 4, pagesCount: 423, publishDate: '1954-07-29', synopsis: 'The volume contains a prologue for readers who have not read The Hobbit, and background information to set the stage for the novel. The body of the volume consists of Book One: "The Ring Sets Out", and Book Two: "The Ring Goes South".' },
    'books/8': { name: 'The two towers', authorId: 4, pagesCount: 352, publishDate: '1954-11-11', synopsis: 'Some editions of the volume contain a Synopsis for readers who have not read the earlier volume. The body of the volume consists of Book Three: The Treason of Isengard, and Book Four: The Ring Goes East.' },
    'books/9': { name: 'The Return of the king', authorId: 4, pagesCount: 416, publishDate: '1955-10-20', synopsis: 'Some editions of the volume contain a synopsis for readers who have not read the earlier volumes. The body of the volume consists of books five and six. Book six has variously been titled The Return of the King (clashing with the title of the third volume) and The End of the Third Age, though in many editions the Books are untitled. The volume ends with a set of appendices and an index, varying in different editions.' },
    'books/10': { name: 'The Silmarillion', authorId: 4, pagesCount: 365, publishDate: '1977-09-15', synopsis: 'The events described in The Silmarillion, as in J. R. R. Tolkien\'s extensive Middle-earth writings which the book summarises, were meant to have taken place at some time in Earth\'s past.[T 3] In keeping with this idea, The Silmarillion was supposedly translated from Bilbo\'s three-volume Translations from the Elvish, which he wrote while at Rivendell.[T 4] The book covers the history of the world, Arda, up to the Third Age, in its five sections' },
    'books/11': { name: 'The Hobbit', authorId: 4, pagesCount: 310, publishDate: '1937-09-21', synopsis: 'The Hobbit is set in Middle-earth and follows home-loving Bilbo Baggins, the titular hobbit who joins the wizard Gandalf and the thirteen dwarves of Thorin\'s Company on a quest to reclaim the dwarves\' home and treasure from the dragon Smaug. Bilbo\'s journey takes him from his peaceful rural surroundings into more sinister territory.' }
    };

    db.ref().update(updates)
    .then(() => {
        console.log('Bulk update books successful');
    })
    .catch((error) => {
        console.error('Bulk update books failed:', error);
    });
}

addAuthorsToDatabase();
addBooksToDatabase();