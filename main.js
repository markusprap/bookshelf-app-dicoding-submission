const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';
let editId;
let isEdited = false;

document.addEventListener(RENDER_EVENT, () => {
    console.log(books);
    const incompleteBookList = document.getElementById('incompleteBookList');
    incompleteBookList.innerHTML = '';

    const completeBookList = document.getElementById('completeBookList');
    completeBookList.innerHTML = '';

    for(const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if(!bookItem.isCompleted) {
            incompleteBookList.append(bookElement);
        } else {
            completeBookList.append(bookElement);
        }
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const submitForm = document.getElementById('bookForm');
    submitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addBook();
        submitForm.reset();
    });

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('search ok')
        searchBook();
    });

    if(isStorageExist()) {
        loadDataFromStorage();
    }

});

function addBook() {
    const bookTitle = document.getElementById('bookFormTitle').value;
    const bookAuthor = document.getElementById('bookFormAuthor').value;
    const bookYear = document.getElementById('bookFormYear').value;
    const isCompleted = document.getElementById('bookFormIsComplete').checked;

    if(isEdited === false) {
        const generateID = generateId();
        const bookObject = generateBookObject(generateID, bookTitle, bookAuthor, bookYear, isCompleted);
        books.push(bookObject);
    } else {
        books[editId].title = bookTitle;
        books[editId].author = bookAuthor;
        books[editId].year = bookYear;
        books[editId].isCompleted = isCompleted;
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

function makeBook(bookObject) {
    const bookTitle = document.createElement('h3');
    bookTitle.innerText = bookObject.title;
    bookTitle.setAttribute('data-testid', 'bookItemTitle');

    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = `Penulis : ${bookObject.author}`;
    bookAuthor.setAttribute('data-testid', 'bookItemAuthor');

    const bookYear = document.createElement('p');
    bookYear.innerText = `Tahun : ${bookObject.year}`;
    bookYear.setAttribute('data-testid', 'bookItemYear');

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
    deleteButton.innerText = 'Hapus Buku';
    deleteButton.addEventListener('click', () => {
        deleteBook(bookObject.id);
    });

    const editButton = document.createElement('button');
    editButton.classList.add('edit-button');
    editButton.setAttribute('data-testid', 'bookItemEditButton');
    editButton.innerText = 'Edit Buku';
    editButton.addEventListener('click', () => {
        editBook(bookObject.id);
    });

    const actionContainer = document.createElement('div')
    actionContainer.classList.add('action');

    if(bookObject.isCompleted) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button');
        undoButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
        undoButton.innerText = 'Belum selesai dibaca';
        undoButton.addEventListener('click', () => {
            undoBookFromCompleted(bookObject.id);
        });

        actionContainer.append(undoButton, deleteButton, editButton);
    } else {
        const completeButton = document.createElement('button');
        completeButton.classList.add('complete-button');
        completeButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
        completeButton.innerText = 'Selesai dibaca';
        completeButton.addEventListener('click', () => {
            addBookToCompleted(bookObject.id);
        });

        actionContainer.append(completeButton, deleteButton, editButton);
    }

    const container = document.createElement('div');
    container.classList.add('book_item');
    container.append(bookTitle, bookAuthor, bookYear, actionContainer);
    container.setAttribute('data-bookid', bookObject.id);

    return container;
}

function searchBook() {
    const searchInput = document.getElementById('searchBookTitle').value.toLowerCase();
    const filteredBooks = books.filter((book) => book.title.toLowerCase().includes(searchInput));

    const incompleteBookList = document.getElementById('incompleteBookList');
    incompleteBookList.innerHTML = '';

    const completeBookList = document.getElementById('completeBookList');
    completeBookList.innerHTML = '';

    if (filteredBooks.length === 0) {
        incompleteBookList.innerHTML = '<p>Tidak ada buku yang ditemukan.</p>';
        return;
    }

    for (const bookItem of filteredBooks) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isCompleted) {
            incompleteBookList.append(bookElement);
        } else {
            completeBookList.append(bookElement);
        }
    }
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if(bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for(const bookItem of books) {
        if(bookItem.id === bookId) {
            return bookItem;
        }
    }

    return null;
}

function deleteBook(bookId) {
    const bookTarget = findBookIndex(bookId);

    if(bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId) {
    for(const index in books) {
        if(books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if(bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function editBook(bookId) {
    const bookTarget = findBook(bookId);
    const bookIndex = findBookIndex(bookId);

    if(bookTarget == null) return;

    const bookTitle = document.getElementById('bookFormTitle');
    const bookAuthor = document.getElementById('bookFormAuthor');
    const bookYear = document.getElementById('bookFormYear');
    const isCompleted = document.getElementById('bookFormIsComplete');

    editId = bookIndex;
    isEdited = true;
    bookTitle.value = bookTarget.title;
    bookAuthor.value = bookTarget.author;
    bookYear.value = bookTarget.year;
    isCompleted.checked = bookTarget.isCompleted;
}

function saveData() {
    if(isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExist() {
    if(typeof Storage === 'undefined') {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, () => {
    console.log('ok');
})

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if(data !== null) {
        for(const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}