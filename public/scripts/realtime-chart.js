function RealTimeChart(divhighselected, chartdata, charttype, nmi, units, name, titleText) {

//	$(divhighselected).children('.graph').show();
	var thisGraphData = chartdata.GraphData;

	var NRT_usage_data = [];
	var NRT_usage_data_temp = [];
	// if there are any missing readings add gaps with nulls
	fillGapsWithNull(thisGraphData,NRT_usage_data);
	
//	console.log(thisGraphData);
//	console.log(NRT_usage_data);
	//var totaldates = (thischartdata.Dates).length;

	//NRT_usage_data = [];
	//NRT_usage_data_temp = [];
	
	var selecteddiv = divhighselected;

	$(selecteddiv).data('Near_Real_Time_intervalID', 0)

	//var Chart_Index = $(selecteddiv).data('Chart_Index');
	var charttext = titleText;
	var interval_time_ms = 60000;

	// Create a timer
	var start = +new Date();
	var i = 0;

	// NRT_usage_data = chartdata.GraphData

////	for (var adddata = 0; adddata < chartdata.GraphData.length; adddata++) {

////		var readingdate = (new Date(chartdata.GraphData[adddata][0]));
////		var readingdate = (chartdata.GraphData[adddata][0]);
////		var readingvalue = (chartdata.GraphData[adddata][1]);
////		NRT_usage_data_temp.push(readingdate)
////		NRT_usage_data_temp.push(readingvalue)
////		NRT_usage_data.push(NRT_usage_data_temp)
////		NRT_usage_data_temp = []

		//if (i < 30) {
		//	console.log("intervaltime--" + Interval_time)
		//	console.log("Interval Concumption---" + Interval_Consumption)
		//	console.log("demand factor Concumption---" + demand_factor)
		//	console.log("Interval_Demand---" + Interval_Demand)
		//}
////	}

	//console.log(NRT_usage_data);

	//	NRT_usage_data = chartdata.GraphData;
	
	

	$(divhighselected).highcharts('StockChart', {
		
		chart : {
		
			//type : 'spline',			
			type : charttype,
			
			
			zoomType : 'x',

			events : {

				load : function() {

					// set up the updating of the chart each second
					var series = this.series[0];
					var chartid = this;

					intervalID = setInterval(function(chart) {

						Last_UTC_date_record = chartdata.GraphData.length
						//console.log('intervalID',intervalID);
						//console.log(Last_UTC_date_record);
						//console.log(chartdata);

						var lastgraphdate = (new Date(chartdata.GraphData[(Last_UTC_date_record -1)][0]));
						var lastdate = (new Date(chartdata.GraphData[(Last_UTC_date_record-1)][0]));

						var lastreadingvalue = (chartdata.GraphData[(Last_UTC_date_record -1)][1]);
						var nextdate = (new Date(chartdata.GraphData[(Last_UTC_date_record -1)][0]));

						lastdate.setTime(lastdate.valueOf() + (60000 * lastdate.getTimezoneOffset()) + 1000);
						nextdate.setTime(lastdate.valueOf() + interval_time_ms + 16)

						lastdate = moment(lastdate);
						nextdate = moment();

						//console.log(lastdate.format("YYYY-MM-DD HH:mm:ss"));
						//console.log(nextdate.format("YYYY-MM-DD HH:mm:ss"));

						var _graphRequest2 = {
							nmiExtended : nmi.replace(/\n|\r|\t|\s/g, ''),

							minReading_datetime : lastdate.format("YYYY-MM-DD HH:mm:ss"),
							maxReading_datetime : nextdate.format("YYYY-MM-DD HH:mm:ss"),
							quantity:91,
						};

						url_string = "https://www.d2i.com.au/nrtim/meterreadings?find=ByNmiExtendedEqualsAndReading_datetimeBetween_jsonp";
						dataType_string = "jsonp";
						cache_bol = true;
						json = (_graphRequest2);

						$.ajax({
							url : url_string,
							dataType : dataType_string,
							cache : cache_bol,
							type : "GET",
							data : _graphRequest2,
							contentType : "application/json; charset=utf-8",
							success : function(pGraphData) {

								if (pGraphData.IsError) {
									alert("Error occured requesting data");
								} else {

									if (pGraphData.GraphData.length > 0) {

										NRT_usage_data = [];
										NRT_usage_data_temp = [];

										var readingdate = series.data[series.data.length-1].x; // Last current epoch in chart
										var readingvalue = series.data[series.data.length-1].y; // Last current value in chart
										// need a null gap when the next reading happens over 5 and half minutes later.
										if (pGraphData.GraphData[0][0]-readingdate>330000) {
											NRT_usage_data_temp.push(readingdate+150000);
											NRT_usage_data_temp.push(null);
											NRT_usage_data.push(NRT_usage_data_temp);
											NRT_usage_data_temp = [];
										}
                                        // if there are any gaps fill them with nulls
										fillGapsWithNull(pGraphData.GraphData, NRT_usage_data);
										
										chartdata.GraphData = pGraphData.GraphData;
										
										for (var adddata = 0; adddata < NRT_usage_data.length; adddata++) {

											var readingdate = (new Date(NRT_usage_data[adddata][0]));
											//console.log('adding time to series '+readingdate.getTime())
											series.addPoint([readingdate.getTime(), NRT_usage_data[adddata][1]], false, true);
										}

										chartid.redraw();
										
										chartid.setTitle(null, {
											text : 'Chart updated at...' + (new Date())
										});

									}
								}
							}
						})

					}, interval_time_ms);

					$(selecteddiv).data('Near_Real_Time_intervalID', intervalID);

				}
			},

			animation : Highcharts.svg, // don't animate in old IE
			marginRight : 10,

		},
		
	    navigator: {
	        series: {
	            includeInCSVExport: false
	        }
	    },

		
		title : {
			text : 'Near Real Time Signal Strength'
		},

		"credits" : {
			"enabled" : false
		},

		yAxis : {		
			
            plotBands : [{
                from : 0,
                to : 14,
                color : 'rgba(68, 170, 213, 0.2)',
                label : {
                    text : 'low signal levels'
                }
            }]
,
			
		 offset: 15,
		 min: 0,
		 
		            // alternateGridColor: '#FDFFD5',
			title : {
				text : " "  + units
			},
			  tickWidth: 1
		},

		series : [{
			name : name,
			connectNulls: false,
			data : NRT_usage_data,
			
			marker : {
				enabled : true,
				radius : 2
			},

			tooltip : {
				valueDecimals : 0,
				valueSuffix : 'dBm'
			},

			dataGrouping : {
				enabled : true
			}
		}],
		
	    exporting: {
	        csv: {
	            dateFormat: "%Y-%m-%d %H:%M:%S",
	            itemDelimiter:','
	        }
	    },

		legend : {
			enabled : false
		},
		
		plotOptions : {
			series : {
				allowPointSelect : true,
				cursor : 'pointer',
				point : {
					events : {
						click : function(event) {
							
							var chart = $(divhighselected).highcharts();

						}
					}
				},
			}
		}
		,
		
		 lang: {
            Real_Time_Key: 'Real Time Data',
            Interval_Key: 'Interval Data',
            Daily_key: 'Daily Data',
            Weekly_key: 'Weekly Data',
            Monthly_key: 'Monthly Data',
            Yearly_key: 'Yearly Data',
            Groupeed_Key: 'Grouped Data',
            Close_Key: 'Close',
            Data_Type: 'Data Type' ,
			Line_Key: 'Line Graph',
			Column_Key: 'Column Graph',
			Area_Key: 'Area Graph',	
			stacked_Key: 'Stacked View'
        },
        subtitle : {
			text : name + " - Updated at..."  + (new Date()) // dummy text to reserve space for dynamic subtitle
		},
	});
}

function fillGapsWithNull(graphData, NRT_GraphData) {
	var readingdate = 0;
	var readingvalue = 0;
	var NRT_usage_data_temp = [];

	for (var dIndex = 0; dIndex < graphData.length; dIndex++) {
		if (dIndex<graphData.length-1) {
		if (graphData[dIndex+1][0]-graphData[dIndex][0]>330000) {
			readingdate = (graphData[dIndex][0]);
			readingvalue = (graphData[dIndex][1]);
			NRT_usage_data_temp.push(readingdate);
			NRT_usage_data_temp.push(readingvalue);
			NRT_GraphData.push(NRT_usage_data_temp);
			NRT_usage_data_temp = [];
			// if time difference between consecutive readings is over than 5 and a half minutes, add a gap with null value
			NRT_usage_data_temp.push(readingdate+150000);
			NRT_usage_data_temp.push(null);
			NRT_GraphData.push(NRT_usage_data_temp);
			NRT_usage_data_temp = [];
		}
		else {
			readingdate = (graphData[dIndex][0]);
			readingvalue = (graphData[dIndex][1]);
			NRT_usage_data_temp.push(readingdate);
			NRT_usage_data_temp.push(readingvalue);
			NRT_GraphData.push(NRT_usage_data_temp);
			NRT_usage_data_temp = [];

		}
		}
		else{
			readingdate = (graphData[dIndex][0]);
			readingvalue = (graphData[dIndex][1]);
			NRT_usage_data_temp.push(readingdate);
			NRT_usage_data_temp.push(readingvalue);
			NRT_GraphData.push(NRT_usage_data_temp);
			NRT_usage_data_temp = [];
		}
			
	};
	
}

