class MovieApp {

    constructor(apikey) {
        this._APIKey = apikey;
        this.favMoviesList = localStorage.getItem('FavMoviesList') ? JSON.parse(localStorage.getItem('FavMoviesList')) : {
            results: []
        };
        this.loadFavMovies();
    }

    get searchTerm() {
        return this._searchTerm;
    }

    set searchTerm(newTerm) {
        this._searchTerm = newTerm;
    }

    loadFavMovies() {
        if (this.favMoviesList.results.length) {
            this.showMovieResults(this.favMoviesList.results, false);
        }
    }

    deleteMovieCallback(event) {
        if (event.target.parentElement.parentElement.tagName.toLowerCase() === "li") {
            event.target.parentElement.parentElement.remove();
        }
    }

    callApi() {
        let _this = this,
            xhr = new XMLHttpRequest();

        xhr.open('GET', "https://api.themoviedb.org/3/search/movie?api_key=" + this._APIKey + "&include_adult=false&query=" + this.searchTerm, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
				document.getElementById('result-wrapper').style.display = "block";
                var response = JSON.parse(xhr.responseText);

                if (response && response.results && response.results.length == 0) {
					document.getElementById('myModal').style.display = "block";
                    console.log('No results found!!!');
                } else {
					_this.showMovieResults(response.results, true);
                }
            } else if (xhr.status == 404) {
				document.getElementById('myModal').style.display = "block";
				console.log('error');
            }
        };

        xhr.send();
    }

    createElement(tagName) {
        return document.createElement(tagName);
    }

    createAttribute(attrName) {
        return document.createAttribute(attrName);
    }

    createTextNode(nodeName) {
        return document.createTextNode(nodeName);
    }
	
    showMovieResults(lists, addListener) {
		let listsView = document.querySelector("ul.lists"),
            _this = this;
        listsView.innerHTML = "";
        if (lists.length) {
			lists.forEach(function(list, index) {
                let liEle = _this.createElement("li"),
                    imgEle = _this.createElement("div"),
                    detailEle = _this.createElement("div"),
                    imgDetailEle = _this.createElement("img"),
                    attrSrc = _this.createAttribute("src"),
                    altText = _this.createAttribute("alt"),
                    discriEle = _this.createElement("div"),
                    titleEle = _this.createElement("div"),
                    dateEle = _this.createElement("div"),
                    nameEle = _this.createElement("span"),
                    actionEle = _this.createElement("button"),
                    deleteEle = _this.createElement("button"),
                    name = _this.createTextNode(list.title),
                    
                    descrip,
                    descriptText = list.overview,
					relDate = _this.createTextNode(_this.formatDate(list.release_date)),
					releaseText = _this.createTextNode('Release Date: '),
                    addToFav = _this.createTextNode('Make Favourite'),
                    deleteMovie = _this.createTextNode('Delete');

                actionEle.className = "favAddListItem";
                deleteEle.className = "deleteListItem";
                titleEle.className = "movie-name";
				discriEle.className = "movie-description";
				dateEle.className = "movie-release-date";
                imgEle.className = "movie-poster";
                detailEle.className = "movie-details";
                attrSrc.value = "https://image.tmdb.org/t/p/w200" + list.poster_path;
                altText.value = "Poster Image";
                nameEle.className = "movie-title";

                if (descriptText.length > 241) {
                    descriptText = descriptText.substring(0, 240) +"...";
				}
                descrip = document.createTextNode(descriptText);
                nameEle.appendChild(name);
                titleEle.appendChild(nameEle);
                
                discriEle.appendChild(descrip);
				dateEle.appendChild(releaseText);
				dateEle.appendChild(relDate);
                discriEle.appendChild(dateEle);
                actionEle.appendChild(addToFav);
                actionEle.setAttribute("id", "favList_" + list.id);
                deleteEle.appendChild(deleteMovie);

                imgEle.appendChild(imgDetailEle);
                imgDetailEle.setAttributeNode(attrSrc);
                imgDetailEle.setAttributeNode(altText);

                detailEle.appendChild(titleEle);
                detailEle.appendChild(discriEle);
                if (addListener) {
                    detailEle.appendChild(actionEle);
                }
                detailEle.appendChild(deleteEle);

                liEle.appendChild(imgEle);
                liEle.appendChild(detailEle);

                listsView.appendChild(liEle);

                deleteEle.addEventListener('click', _this.deleteMovieCallback);

                if (addListener) {

                    let addToFavBtn = document.getElementById("favList_" + list.id);

                    addToFavBtn.addEventListener('click', function (e) {

                        let targetEle = e.target,
                            existingMovie = true;

                        let id = targetEle.getAttribute('id').substring(8, targetEle.getAttribute('id').length);
                        e.target.style.display = 'none';
                       
                        var selectedMovieObj = lists.find(function (obj) {
                            return obj.id == id;
                        });


                        if (_this.favMoviesList.results.length > 0) {
                            _this.favMoviesList.results.map(item => {

                                if (item.id == id) {
                                    existingMovie = false;
                                }
                            });

                            if (existingMovie) {

                                _this.favMoviesList.results.push(selectedMovieObj);
                            }
                        } else {
                            _this.favMoviesList.results.push(selectedMovieObj);
                        }

                        _this.addMovieToFavList(JSON.stringify(_this.favMoviesList));

                    });
					let liElementCount = document.getElementById("lists").getElementsByTagName("li").length;//'"'+_this.searchTerm + 
                    document.getElementById("search-label").innerHTML = '"' + liElementCount +'" Results found for "'+ _this.searchTerm + '"' ;
                } else {
                    document.getElementById("search-label").innerHTML = "My Favourite Movie List";
                }
            });
        }
    }

    addMovieToFavList(data) {
        localStorage.setItem('FavMoviesList', data);
    }

    formatDate(input) {
        if (input) {
            let datePart = input.match(/\d+/g),
                year = datePart[0] ? datePart[0] : '',
                month = datePart[1] ? datePart[1] : '',
                day = datePart[2] ? datePart[2] : '';

            return day + '/' + month + '/' + year;
        } else {
            return '';
        }
    }

    filterResults(filterKey) {
        let resultList = document.querySelectorAll('.result-list .lists li'),
            _this = this;

        Array.from(resultList).forEach(function(listElem) {
            if (listElem.querySelector('.movie-details .movie-name .movie-title').textContent.toLowerCase().indexOf(filterKey.toLowerCase()) > -1) {
                listElem.style.display = "flex";
            } else {
                listElem.style.display = "none";
            }
        });
    }

    submitFormAction() {
		let inputValue = document.getElementById("search").value;

		if (inputValue) {
			this.searchTerm = inputValue;
			this.callApi();
		}
    }

}

(function (document){

    const movieObject = new MovieApp('d2f3e3c3c35f70eb7d6e51b00585b083');
	document.getElementById('search-label').innerHTML = "";
	document.getElementById('lists').innerHTML = "";
    document.getElementById('movieSearch').addEventListener('submit', function (event) {
        event.preventDefault();
        movieObject.submitFormAction();
    });
    document.getElementsByClassName('favMovies')[0].addEventListener('click', function (event) {
        event.preventDefault();
        movieObject.loadFavMovies();
    });
    document.getElementById('filter_movie').addEventListener('input', function (event) {
        event.preventDefault();
        let searchKey = event.target.value || '';
        movieObject.filterResults(searchKey);
    });
	
	let modal = document.getElementById('myModal');
	let span = document.getElementsByClassName("close")[0];
	modal.style.display = "none";
	
	span.onclick = function() {
		modal.style.display = "none";
	}
	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	}

})(document);
