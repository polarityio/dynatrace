# Polarity Dynatrace Integration

## Splunk Integration Options

### Base URL

### Search App URL

### Dynatrace Username

Valid Dynatrace username. Leave this field blank is authenticating via a Splunk Authentication Token.

### Dynatrace Password

Valid Dynatrace password corresponding to the username specified above. Leave this field blank is authenticating via a Dynatrace Authentication Token.

### Dynatrace Authentication Token

A Splunk Authentication Token which can be created from the Splunk web interface by going to "Settings -> Tokens".

### Dynatrace Search String

Splunk Search String to execute. The string `{{ENTITY}}` will be replaced by the looked up indicator. For example: index=logs value=TERM({{ENTITY}}) | head 10.

For example, to search the `mainIndex` you might use a query like this:

```
search index=mainIndex indicator=TERM({{ENTITY}})
```

Note the use of the `TERM` directive can allow for more efficient searching of indicators such as IP addresses.

The TERM directive can be used to speed up your search when the entity to search meets the following conditions:

- The entity contains minor breakers, such as periods or underscores (e.g., the periods in an IP address)
- The entity is bound by major breakers in the data (i.e., spaces, commas, semicolons, question marks, parentheses, exclamation points, and quotation marks)
- The entity does not contain major breakers

As an example of where the TERM directive will not work is if your data has the following format:

```
src=8.8.8.8
```

In this example, the equal (=) symbol is a minor breaker (as opposed to a major breaker). Since the IP address `8.8.8.8` is not bound or surrounded by major breakers, the IP `8.8.8.8` is not indexed and will not be found by the TERM search `TERM("8.8.8.8")`.

One way to work around this is to more specifically specify your term in the Splunk Search String. For example, to find the above example you could do the following:

```
search index=mainIndex TERM({{ENTITY}}) OR TERM("src={{ENTITY}}")
```

For more information on the TERM directive see the Splunk documentation here: https://docs.splunk.com/Documentation/SplunkCloud/latest/Search/UseCASEandTERMtomatchphrases

#### Limit Searches by Time

As a general rule of thumb you should try to narrow down the search scope. A great way to limit the search scope is limit the time frame of data you are searching. You can limit the time bounds of your search by using the `Earliest Time Bounds` option. If you manually specify a time bounds using the "earliest" directive you should clear the `Earliest Time Bounds` option.

For a list of valid time modifiers see the documentation here: https://docs.splunk.com/Documentation/SCS/current/Search/Timemodifiers

Common examples include

- `-6mon`: last 6 months
- `-1mon`: last month
- `-7d`: last 7 days
- `-4h`: last 4 hours

#### Limit Searches by Records

If your search can return more than 1 result you should always limit your query to only return a small number of events. This can be done using the `head` parameter:

```
search source="malicious-indicators" sourcetype="csv" value=TERM({{entity}}) | head 10
```

The above search will search the `malicious-indicators` source and return events where the `value` field equals the `{{ENTITY}}` being looked up. The search will only search the last 90 days of data and will only return the first 10 results.

#### Limit the Amount of Return Data

It is also important to limit how much data your search returns. You can specify specific fields to include using the `fields` parameter. For example, if you only want to return the `score`, `status`, and `value` fields you could use the following query:

```
search source="malicious-indicators" sourcetype="csv" value=TERM({{entity}}) | fields score, status, value | head 10
```

In addition to specifying which fields to return you can also tell Splunk not to return certain fields. In particular, you can cut down on the amount of data returned by telling Splunk not to return the `_raw` field which is the entire raw event record as a string. To tell Splunk not to return specific fields you add the `-` (minus sign), in front of the field names you do not want to return. By default, Splunk will return the `_raw` field so it is a good idea to specifically remove it.

```
search source="malicious-indicators" sourcetype="csv" value=TERM({{entity}}) | fields score, status, value | fields - _raw | head 10
```

### Earliest Time Bounds

Sets the earliest (inclusive) time bounds for the "Splunk Search String" or "Index Discovery Metasearch". If set, this option will override any time bounds set in the "Splunk Search String" option". Leave blank to only use time bounds set via the "Splunk Search String" option. This option should be set to "Users can view only". Defaults to `-1mon`.

Common examples include

- `-6mon`: last 6 months
- `-1mon`: last month
- `-7d`: last 7 days
- `-4h`: last 4 hours

### Summary Fields

Comma delimited list of field values to include as part of the summary (no spaces between commas). These fields must be returned by your search query. This option must be set to "User can view and edit" or "User can view only".

> It is important that this setting is set to "User can view only" or "User can view and edit". This is required so the option is available to non-admin users in their Overlay Window.

As an example, if our query is as follows:

```
search source="malicious-indicators" sourcetype="csv" value=TERM({{entity}}) | fields score, status, value | head 10
```

We could show just the score and status in the summary view by setting the "Summary Fields" option to:

```
score,status
```

### Search KV Store

If checked, the KV Store will be searched using the parameters below, which will replace and disable your Standard Splunk Search above.

### KV Store Apps & Collections to Search

A comma separated list of App and Collection pairs found in the KV Store you want to run your searches on. Each comma separated pair must use the format `<app-name>:<collection-name>`
To see a list of available collections to search, leave this field empty, check the "Search KV Store" option above, and click "Apply Changes".

### KV Store Search Fields

A comma separated list of KV Store Collection Fields to search on. To see a list of available fields to search on, leave this field empty, check the "Search KV Store" option above, and set "KV Store Apps & Collections to Search" to your desired collections, then click "Apply Changes".

> **_Note:_** Minimizing these will improve KV Store search times.
> **_Note:_** You can also use these fields in the "Summary Fields" option above.

## Installation Instructions

Installation instructions for integrations are provided on the [PolarityIO GitHub Page](https://polarityio.github.io/).

## Polarity

Polarity is a memory-augmentation platform that improves and accelerates analyst decision making. For more information about the Polarity platform please see:

https://polarity.io/
