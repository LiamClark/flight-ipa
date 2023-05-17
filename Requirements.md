Functional Reactive Assignment with OpenSky (draft v2) 
We want to provide real-time air traffic data to our customer, with this data we want to
show flight data and statistics. 

The interpretation and how you build it is for a large extent up to you, as long as you
show off your qualities and knowledge of Functional Reactive Programming. 
 1. Retrieve the real-time data from the OpenSky API. Only use the endpoint
https://opensky-network.org/api/states/all. See the documentation at
https://openskynetwork.github.io/opensky-api/rest.html  

 2. You will show aggregated data (see requirements), use what you think is
important in functional reactive programming to postprocess the data from
the OpenAPI. Use the endpoint mentioned above so you can show how to
aggregate data yourself. Below is a list of requirements, but you can
always add other statistics to show off your FRP skills! 

 3. If you consider yourself a front-end/full-stack developer: use a framework
(front-end e.g. React or Angular, but other frameworks are fine too) 

 4. If you consider yourself a back-end/full-stack developer: use a framework
(Scala: Akka-HTTP of Play framework, Kotlin: KTOR; any other framework
is fine) 

 5. Make sure the result is production ready 

 6. Post the result on GitHub 
Requirements: 
1. Use Functional Reactive Programming 
2. Only use the endpoint https://opensky-network.org/api/states/all 
3. Show the number of flights above the Netherlands per hour 
4. Show the top 3 countries of origin since the application is running 
5. Show which flights are part of an altitude slice (slices of 1km) 
6. Show the following statistic about altitude: divide altitude from ground level
in layers of 1000 meters, so layer 0 from 0 – 999m, layer 1 from 1000 to
1999m, etc. Show what flights are in which altitude layer. When a flight will
change altitude layer based on its vertical_rate before the next polling
interval, mark it with a &quot;warning&quot; property. 

Good luck and have fun!
