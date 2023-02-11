# JMeter Demo Project
This is a sample project for load testing on a Demo Store using JMeter, which uses data driven test approach together with the following features:

	* Number of Threads (users), Ramp-Up Period, and Loop Count are defined through variables in the Test Plan
	* CSV Data Set Config to read the test data
	* Transaction Controller to group requests according to the functionality being tested
	* Response Assertion to validate the desired text content in the response
	* Regular Expression Extractor to extract the information needed (e.g. Authentication Token)
	* Debug PostProcessor to investigate any issue found during test run on GUI modef
	* HTML Report generated automatically when executing the test through command line using the batch file included in the project
