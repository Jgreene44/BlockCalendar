//This one was hard for me since I have very little knowledge of JS and frontend here are some of the resources I used to get a better understanding of what to do
//https://code.daypilot.org/88013/javascript-calendar-blocking-selected-dates
//https://github.com/kylestetz/CLNDR
//https://github.com/jquense/react-big-calendar

//Starting up the module and creating it
Module.register("BlockCalendar", {

	defaults: {
		updateInterval:		5,
	},

    // Required scripts we need to make this calendar possible
	getScripts: function() {
		return ["moment.js"];
	},

	// Required styles that we need
	getStyles: function() {
		return ["styles.css"];
	},


    //This is what we run when we start the module
	start: function() {
		Log.log("Starting BlockCalendar");
		moment.locale(config.language);
		
		// Calculate when to update next (midnight) and add a delay to referesh from
		var now = moment();
		this.midnight = moment([now.year(), now.month(), now.date() + 1]).add(this.config.updateDelay, "seconds");
		this.loaded = false;
		this.scheduleUpdate(0 * 1000);
	},

	//This is how we write to the frontend
	getDom: function() {

        //checking to see if we are past midnight or if we arent loaded
		if ((moment() > this.midnight) || (!this.loaded)) {

            //Grabbing our data we need to build the calendar from Moment
			var month = moment().month();
			var year = moment().year();
			var monthName = moment().format("MMMM");
			var monthLength = moment().daysInMonth();

			// Find first day of the month
			var firstDay = moment().date(1).weekday();
            //creating the table we need
			var wrapper = document.createElement("table");
			wrapper.className = 'xsmall';
			wrapper.id = 'calendar-table';

			// Create THEAD section with month name and the year
			var h = document.createElement("tHead");
			var hTR = document.createElement("tr");

			
            var hTH = document.createElement("th");
            hTH.colSpan = "7";
            hTH.scope = "col";
            hTH.id = "calendar-th";
            var hMonthSpan = document.createElement("span");
            hMonthSpan.id = "monthName";
            hMonthSpan.innerHTML = monthName;
            var hYearSpan = document.createElement("span");
            hYearSpan.id = "yearDigits";
            hYearSpan.innerHTML = year;
            // Add space between the two elements
            var hSpace = document.createTextNode(" ");

            hTH.appendChild(hMonthSpan);
            hTH.appendChild(hSpace);
            hTH.appendChild(hYearSpan);
            hTR.appendChild(hTH);
			
			h.appendChild(hTR);
			wrapper.appendChild(h);

			// Create TBODY section with the names of the days
			var content = document.createElement("tBody");
			var TR = document.createElement("tr");
			TR.id = "calendar-header";

			for (var i = 0; i <= 6; i++ ){
				var TD = document.createElement("td");
				TD.className = "calendar-header-day";
				TD.innerHTML = moment().weekday(i).format("ddd");
				TR.appendChild(TD);
			}
			content.appendChild(TR);
			wrapper.appendChild(content);

			// Create section with the monthly calendar
			var content = document.createElement("tBody");
			var TR = document.createElement("tr");
			TR.className = "weekRow";

			// Fill in all of the days
			var day = 1;
			var next = 1;
			// Loop for amount of weeks (as rows)
			for (var i = 0; i < 9; i++) {
				// Loop for each weekday (as individual cells)
				for (var j = 0; j <= 6; j++) {
                    //creating all of the individual elements for the calendar
					var TD = document.createElement("td");
					TD.className = "calendar-day";
					var square = document.createElement("div");
					square.className = "square-box";
					var content = document.createElement("div");
					content.className = "square-content";
					var squareInner = document.createElement("div");
					var inner = document.createElement("span");

					if (j < firstDay && i == 0) {
						//filling in the first row but we need to check for empty space
						inner.className = "monthPrev";
						inner.innerHTML = moment().subtract(1, 'months').endOf('month').subtract((firstDay - 1) - j, 'days').date();
					} else if (day <= monthLength && (i > 0 || j >= firstDay)) {
						if (day == moment().date()) {
							inner.id = "day" + day;
							inner.className = "today";
						} else {
							inner.id = "day" + day;
							inner.className = "daily";
						}
						inner.innerHTML = day;
						day++;
					} else if (day > monthLength && i > 0) {
						// Last row, fill in empty space
						inner.className = "monthNext";
						inner.innerHTML = moment([year, month, monthLength]).add(next, 'days').date();
						next++;
					}
					squareInner.appendChild(inner);
					content.appendChild(squareInner);
					square.appendChild(content);
					TD.appendChild(square);	
					TR.appendChild(TD);
				}
				// Don't need any more rows if we've run out of days
				if (day > monthLength) {
					break;
				} else {
					TR.appendChild(TD);
					content.appendChild(TR);
					var TR = document.createElement("tr");
					TR.className = "weekRow";
				}
			}	

			content.appendChild(TR);
			wrapper.appendChild(content);

			this.loaded = true;
			return wrapper;

		}

	},

    //We use this to scedule frontend updates
	scheduleUpdate: function(d) {

		if (typeof d !== "undefined" && d >= 0) {
			nextReload = d;
		}

		if (d > 0) {
			// check when our next reload is
			nextReload = moment.duration(nextReload.diff(moment(), "milliseconds"));
		}

		var self = this;
		setTimeout(function() {
			self.reloadDom();
		}, nextReload);

	},

    //We use this when we are reloading the frontend
	reloadDom: function() {
		if (this.config.debugging) {
			Log.log("Reloading BlockCalendar");
		}

		var now = moment();
		if (now > this.midnight) {
			this.updateDom(2 * 1000);
			this.midnight = moment([now.year(), now.month(), now.date() + 1]).add(this.config.updateDelay, "seconds");
		}

		var nextRefresh = moment([now.year(), now.month(), now.date(), now.hour() + 1]);
		this.scheduleUpdate(nextRefresh);
	}

});