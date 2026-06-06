---
sidebar_position: 2
title: Functions
description: Complete reference of all scalar/table functions in Yres.
---


> Prefer managing via the web app; these objects are for the SQL endpoint (SSMS / Azure Data Studio).

## Functions

### `[Change].[fxGetChangeIsOpen]`

**Purpose:**

Determines if a specific change, identified by @ChangeId , is currently open.

**Input Parameters:**

- `@ChangeId (int)`: The ID of the change to check.

**Output:**

Returns 1  if the change is open, 0  if it is not open.

**Description:**

This function joins the Change.Changes  and Change.Status  tables to check if the status of the given change ID is marked as open. It also ensures the change originates from the correct server and database.

### `[Change].[fxGetLaspageChangeIdFor]`

**Purpose:**

Retrieves the lapage change ID that includes a specific object type and name.

**Input Parameters:**

- `@objectType (int)`: The type of the object (e.g., table, view).

- `@objectName (nvarchar(1024))`: The name of the object.

**Output:**

Returns the lapage change ID (int) for the specified object.

**Description:**

The function searches the Change.ChangeContent  table for the lapage change entry related to the specified object type and name. It handles specific conditions where table content or definitions are involved and returns the relevant change ID.

### `[Change].[fxGetLapageOpenChange]`

**Purpose:**

Fetches the lapage open change for a specified object type and name.

**Input Parameters:**

- `@ObjectType (nvarchar(10))`: The type of the object.

- `@ObjectName (nvarchar(1024))`: The name of the object.

**Output:**

Returns the lapage open change ID (int).

**Description:**

This function combines the functionalities of [Change].[fxGetLaspageChangeIdFor]  and [Change].[fxGetChangeIsOpen]  to find and return the lapage open change for the given object type and name.

### `[Change].[fxGetReleasedJson]`

**Purpose:**

Retrieves the JSON data associated with a specific change ID.

**Input Parameters:**

- `@ChangeID (int)`: The ID of the change.

**Output:**

Returns the JSON data (nvarchar(max)) related to the change.

**Description:**

The function queries the Change.Changes  table to obtain the JSON data stored for a particular change ID.

### `[Change].[fxGetTableDefinition]`

**Purpose:**

Generates a SQL script to recreate a table definition, including columns, indexes, constraints, and optionally the content as JSON.

**Input Parameters:**

Various parameters to control the script generation, such as @ObjectName ,
- @UseTransaction , @GenerateFKs , etc.

**Output:**

Returns the generated SQL script (nvarchar(max)).

**Description:**

This comprehensive function creates a detailed SQL script to recreate a table, including its structure and content. The generated script can optionally include foreign keys, identity columns, constraints, and table content as JSON.

### `[Change].[fxGetTableTypeDefinition]`

**Purpose:**

Generates the SQL script to define a table type based on its name.

**Input Parameters:**

- `@ObjectName (nvarchar(1024))`: The name of the table type.

**Output:**

Returns the table type definition script (nvarchar(max)).

**Description:**

The function constructs the SQL script needed to recreate a user-defined table type, including its columns and their properties.

### `[Config].[fxAddTryCatch]`

**Purpose:**

Wraps a given SQL script in a try-catch block for error handling and logging.

**Input Parameters:**

- `@SQL (nvarchar(max))`: The SQL script to be executed.

- `@process (uniqueidentifier)`: The process ID for logging.

- `@spName (nvarchar(max))`: The stored procedure name for logging.

- `@spStep (nvarchar(max))`: The step name within the stored procedure.

- `@spCall (nvarchar(max))`: The stored procedure call information.

- `@appUser (nvarchar(max))`: The application user executing the script.

**Output:**

Returns the wrapped SQL script (nvarchar(max)).

**Description:**

The function adds error handling to a given SQL script by wrapping it in a try-catch block. It logs the process and any errors using predefined stored procedures.

### `[Config].[fxGetSchemaName]`

**Purpose:**

Retrieves the schema name for a specific target and type, considering configuration settings and overrides.

**Input Parameters:**

- `@Target (nvarchar(max))`: The target for which the schema name is required.

- `@Type (nvarchar(max))`: The type of schema (e.g., 'HIS', 'STAGE').

**Output:**

Returns the schema name (nvarchar(max)).

**Description:**

The function determines the schema name based on configuration settings and potential overrides in the loadmanagement.UsedTables  table.

### `[Config].[fxGetSession]`

**Purpose:**

Returns session details for active connections, formatted as JSON.

**Input Parameters:**

None.

**Output:**

Returns session details (nvarchar(max)) as JSON.

**Description:**

This function queries the sys.dm_exec_connections  and sys.dm_exec_sessions  system views to retrieve details of active sessions, formatting the results as JSON.

### `[Config].[fxGetSetting]`

**Purpose:**

Fetches a configuration setting value by name, with special handling for 'GodMode'.

**Input Parameters:**

- `@SettingName (nvarchar(max))`: The name of the setting to retrieve.

**Output:**

Returns the setting value (nvarchar(max)).

**Description:**

The function retrieves the value of a specified setting from the Config.Settings  table. It includes special handling for 'GodMode', which can override certain settings.

### `[dbo].[fxGeneratePassword]`

**Purpose:**

Generates a random password of a specified length.

**Input Parameters:**

- `@Length (int)`: The desired length of the password (default is 16).

**Output:**

Returns the generated password (nvarchar(1024)).

**Description:**

This function generates a random password containing characters between ASCII values 48 and 122, ensuring a mix of alphanumeric characters.

### `[dbo].[fxGetJsonCollection]`

**Purpose:**

Retrieves a JSON collection from a given JSON string.

**Input Parameters:**

- `@Json (nvarchar(max))`: The input JSON string.

**Output:**

Returns the JSON collection (nvarchar(1024)).

**Description:**

The function extracts a JSON collection from an input JSON string by querying the dbo.fxGetJsonCollections  function.

### `[dbo].[fxRemoveNonAlphaCharacters]`

**Purpose:**

Removes non-alphabetic characters from a given string.

**Input Parameters:**

- `@Temp (varchar(1000))`: The input string.

**Output:**

Returns the cleaned string (varchar(1000)) with only alphabetic characters.

**Description:**

The function iterates through the input string and removes any non-alphabetic characters, returning a string that contains only alphabetic characters.

### `[dbo].[fxStripCharacters]`

**Purpose:**

Strips specified characters from a string based on a match expression.

**Input Parameters:**

- `@String (nvarchar(max))`: The input string.

- `@MatchExpression (varchar(255))`: The match expression defining characters to be stripped.

**Output:**

Returns the cleaned string (nvarchar(max)) with specified characters removed.

**Description:**

The function removes characters from the input string that match the provided match expression, useful for cleaning up strings based on custom criteriFunction: [dbo].[fxToDecimal]

### `[dbo].[fxToDecimal]`

**Purpose:**

Converts a string to a decimal, handling various formats and potential negative values.

**Input Parameters:**

- `@string (nvarchar(1024))`: The input string to be converted.

- `@decimals (int, default 0)`: The number of decimal places.

- `@findNegative (bit, default 1)`: Indicates whether to check for negative values.

**Output:**

Returns the converted decimal value (decimal(25,8)).

**Description:**

This function attempts to convert a string to a decimal, handling different formats and considering negative values if specified.

### `[dbo].[fxToProper]`

**Purpose:**

Converts a string to proper case (first letter uppercase, rest lowercase).

**Input Parameters:**

- `@string (nvarchar(4000))`: The input string.

**Output:**

Returns the converted string (nvarchar(4000)).

**Description:**

The function converts the input string to proper case, making the first letter uppercase and the rest of the letters lowercase.

### `[dbo].[fxUNIXtoDateTime]`

**Purpose:**

Converts a UNIX timestamp (epoch) to a datetime value.

**Input Parameters:**

- `@epochStringDate (nvarchar(50))`: The input UNIX timestamp as a string.

**Output:**

Returns the converted datetime value (datetime2(0)).

**Description:**

The function converts a UNIX timestamp (epoch) into a SQL Server datetime value, making it easier to work with in SQL queries.

### `[dbo].[fxUTC2`

CET]

**Purpose:**

Converts a UTC datetime value to Central European Time (CET).

**Input Parameters:**

- `@UTC_DateTime (datetime)`: The input UTC datetime value.

**Output:**

Returns the converted CET datetime value (datetime).

**Description:**

The function converts a given UTC datetime value to the corresponding Central European Time (CET) datetime value. These functions provide a variety of utility operations, from checking the status of changes, generating SQL scripts, handling configurations, to manipulating and converting data types.

### `[LoadManagement].[fxGetActualTablename]`

**Purpose:**

Fetches the actual table name for a given source, schema, and table.

**Input Parameters:**

- `@Source (nvarchar(1024))`: The source system name.

- `@Schema (nvarchar(1024))`: The schema name.

- `@Table (nvarchar(1024))`: The table name.

**Output:**

Returns the actual table name (nvarchar(4000)).

**Description:**

This function queries the LoadManagement.UsedTables  table to find the actual table name corresponding to the given source, schema, and table. If not found, it looks up in the CustomYres.Extractor  table.

### `[LoadManagement].[fxGetDataType]`

**Purpose:**

Determines the full target column data type based on various input parameters.

**Input Parameters:**

- `@source (nvarchar(256))`: The source system name.

- `@dataType (nvarchar(256))`: The source data type.

- `@sourceLength (int)`: The length of the source data type.

- `@sourcePrecision (int)`: The precision of the source data type.

- `@sourceScale (int)`: The scale of the source data type.

- `@schema (nvarchar(256), default 'N/A')`: The schema name.

- `@table (nvarchar(256), default 'N/A')`: The table name.

- `@column (nvarchar(256), default 'N/A')`: The column name.

**Output:**

Returns the full target data type (nvarchar(256)).

**Description:**

This function maps the source data type to a target data type using the LoadManagement.TypeMapping  and LoadManagement.GlobalTypeMapping  tables. It considers length, precision, and scale attributes, and includes any necessary overrides.

### `[LoadManagement].[fxGetKeyColumns]`

**Purpose:**

Retrieves key columns for a specified table, including options for additional formatting.

**Input Parameters:**

- `@Source (nvarchar(1024))`: The source system name.

- `@Schema (nvarchar(1024))`: The schema name.

- `@Table (nvarchar(1024))`: The table name.

- `@withType (bit, default 0)`: Flag to include data type.

- `@enclosureChar (nvarchar(1), default '"')`: Character to enclose column names.

- `@seperatorChar (nvarchar(1), default ',')`: Character to separate columns.

**Output:**

Returns the key columns (nvarchar(max)).

**Description:**

This function fetches the key columns for the specified table from LoadManagement.vwDictionary . If no key columns are found, it defaults to using all columns.

### `[LoadManagement].[fxGetKeyHashColumns]`

**Purpose:**

Generates a hash of key columns for a specified table.

**Input Parameters:**

- `@Source (nvarchar(1024))`: The source system name.

- `@Schema (nvarchar(1024))`: The schema name.

- `@Table (nvarchar(1024))`: The table name.

**Output:**

Returns the key hash columns (nvarchar(max)).

**Description:**

This function constructs a concatenation of key columns to generate a hash value for the specified table. If no key columns are found, it defaults to using all columns.

### `[LoadManagement].[fxGetOptimized]`

**Purpose:**

Determines if a table is memory-optimized based on settings or actual status.

**Input Parameters:**

- `@Type (nvarchar(50))`: The type of optimization ('STAGE' or 'HIS').

- `@Table (nvarchar(250))`: The table name.

- `@Status (nvarchar(50), default 'Intended')`: Specifies whether to check intended or actual status.

**Output:**

Returns the optimization status (nvarchar(20)).

**Description:**

This function checks if a table is memory-optimized based on its settings in LoadManagement.UsedTables  or Config.Settings . It can return either the intended or actual status.

### `[LoadManagement].[fxGetRowColumns]`

**Purpose:**

Retrieves the row columns for a specified table, with options for additional formatting.

**Input Parameters:**

- `@Source (nvarchar(1024))`: The source system name.

- `@Schema (nvarchar(1024))`: The schema name.

- `@Table (nvarchar(1024))`: The table name.

- `@withType (bit, default 0)`: Flag to include data type.

- `@enclosureChar (nvarchar(1), default '"')`: Character to enclose column names.

- `@seperatorChar (nvarchar(1), default ',')`: Character to separate columns.

**Output:**

Returns the row columns (nvarchar(max)).

**Description:**

This function fetches the row columns for the specified table from LoadManagement.vwDictionary , including optional data type and formatting based on input parameters.

### `[LoadManagement].[fxGetRowHashColumns]`

**Purpose:**

Generates a hash of row columns for a specified table.

**Input Parameters:**

- `@Source (nvarchar(1024))`: The source system name.

- `@Schema (nvarchar(1024))`: The schema name.

- `@Table (nvarchar(1024))`: The table name.

**Output:**

Returns the row hash columns (nvarchar(max)).

**Description:**

This function constructs a concatenation of row columns to generate a hash value for the specified table.

### `[LoadManagement].[fxGetStoreType]`

**Purpose:**

Determines the storage type (row or column) for a table based on settings or actual status.

**Input Parameters:**

- `@Table (nvarchar(250))`: The table name.

- `@Status (nvarchar(50), default 'Intended')`: Specifies whether to check intended or actual status.

**Output:**

Returns the storage type (nvarchar(20)).

**Description:**

This function checks if a table uses row or column storage based on its settings in LoadManagement.UsedTables  or Config.Settings . It can return either the intended or actual status.

### `[LoadManagement].[fxGetSurrogate]`

**Purpose:**

Retrieves the surrogate key setting for a specified table.

**Input Parameters:**

- `@Table (nvarchar(4000))`: The table name.

**Output:**

Returns the surrogate key setting (int).

**Description:**

This function checks the surrogate key setting for the specified table in LoadManagement.UsedTables . If not found, it defaults to a global setting from Config.Settings .

### `[LoadManagement].[fxPredictKeyColumns]`

**Purpose:**

Predicts key columns for a new table based on existing metadata.

**Input Parameters:**

- `@Source (nvarchar(1024))`: The source system name.

- `@Schema (nvarchar(1024))`: The schema name.

- `@Table (nvarchar(1024))`: The table name.

**Output:**

Returns the predicted key columns (nvarchar(max)).

**Description:**

This function predicts the key columns for a new table based on existing metadata in LoadManagement.Dictionary . If no key columns are found, it defaults to using all non-nullable columns.

### `[LoadManagement].[fxPredictTableName]`

**Purpose:**

Predicts the table name based on source, schema, and table parameters.

**Input Parameters:**

- `@Source (nvarchar(1024))`: The source system name.

- `@Schema (nvarchar(1024))`: The schema name.

- `@Table (nvarchar(1024))`: The table name.

**Output:**

Returns the predicted table name (nvarchar(4000)).

**Description:**

This function constructs a predicted table name using the source, schema, and table parameters, considering any overrides specified in LoadManagement.UsedTables .

### `[oData].[fxBaseResponse]`

**Purpose:**

Generates a base oData response URL for metadata.

**Input Parameters:**

- `@BaseUrl (nvarchar(3000))`: The base URL.

**Output:**

Returns the oData base response (nvarchar(max)).

**Description:**

This function constructs a base oData response URL, appending the metadata endpoint and listing all tables and views available in the database.

### `[oData].[fxMetadataResponse]`

**Purpose:**

Generates oData metadata response.

**Input Parameters:**

- `@BaseUrl (nvarchar(3000))`: The base URL.

**Output:**

Returns the oData metadata response (nvarchar(max)).

**Description:**

This function generates an oData metadata response, including details about entity types and sets. It

maps SQL types to corresponding oData EDM types and ensures the response adheres to oData standards.

### `[Metadata].[fxGetViewSources]`

**Purpose:**

Retrieves the source objects (tables or views) for a specified view.

**Input Parameters:**

- `@VIEW (nvarchar(256))`: The name of the view.

**Output:**

Returns a table with the source objects and their details.

**Description:**

This function identifies the source objects used by a specified view by parsing the view definition and querying system tables to find the related tables or views.

### `[Metadata].[fxGetViewSourcesRecursive]`

**Purpose:**

Recursively retrieves the source objects (tables or views) for a specified view.

**Input Parameters:**

- `@VIEW (nvarchar(256))`: The name of the view.

**Output:**

Returns a table with the source objects and their details, including recursive sources.

**Description:**

This function recursively identifies the source objects used by a specified view and any views that those source objects depend on, providing a comprehensive list of all related tables or views. These functions offer a variety of utility operations, from retrieving and predicting table names, generating metadata responses, to recursively identifying dependencies in views.

### `[Monitoring].[fxGetTableLoads]`

**Purpose:**

This function retrieves a paginated list of load records for a specific source and target, showing the ETL date and status. It is useful for monitoring and tracking the loading processes of different tables.

**Inputs:**

- `@offset (int)`: The number of rows to skip before starting to return rows.

- `@top (int)`: The number of rows to return.

- `@source (nvarchar(1024))`: The source system name.

- `@target (nvarchar(1024))`: The target table name.

**Outputs:**

[Source system]  (nvarchar(1024)): The source system name.

[Target]  (nvarchar(1024)): The target table name.

[ETL Date]  (datetime): The ETL date of the load.

[Status]  (nvarchar(50)): The status of the load.

### `[LoadManagement].[fxExtractor]`

**Purpose:**

This function generates a dynamic dataset of tables and their metadata for extraction. It includes source type, delta scripts, and load filters based on the provided parameters. This function is essential for preparing and managing data extraction processes in a data warehouse environment.

**Inputs:**

- `@LoadFilter (nvarchar(max), default NULL)`: The filter to apply on the load.

- `@LoadType (nvarchar(max), default NULL)`: The type of load (e.g., FULL, DELTA).

- `@PackageSize (int, default NULL)`: The size of the package for loading.

**Outputs:**

sourceType  (nvarchar(50)): The type of the source system.

isFile  (bit): Indicates if the source is a file.

Source  (nvarchar(1024)): The source system name.

SourceSchema  (nvarchar(1024)): The source schema name.

SourceTable  (nvarchar(1024)): The source table name.

TechSchema  (nvarchar(1024)): The technical schema name.

TechTable  (nvarchar(1024)): The technical table name.

DataPlatform  (nvarchar(1024)): The name of the data platform.

LoadType  (nvarchar(50)): The type of load (FULL, DELTA, etc.).

DeltaColumn  (nvarchar(1024)): The delta column name used for incremental loads.

LapageRecord  (nvarchar(1024)): The lapage record identifier.

DeltaScript  (nvarchar(max)): The generated SQL script for extracting delta changes.

loadFilter  (nvarchar(max)): The load filter applied to the extraction.

Pipeline  (nvarchar(1024)): The associated pipeline for the load.

Trigger  (nvarchar(1024)): The trigger information.

fileLocation  (nvarchar(1024)): The location of the file source.

fileName  (nvarchar(1024)): The name of the file source.

TargetSource  (nvarchar(1024)): The target source system name.

TargetSchema  (nvarchar(1024)): The target schema name.

TargetTable  (nvarchar(1024)): The target table name.

Target  (nvarchar(1024)): The formatted target table name.

keepStage  (bit): Indicates if the staging data should be kept.

TargetSchemaHIS  (nvarchar(1024)): The target historical schema name.

TargetSchemaSTAGE  (nvarchar(1024)): The target staging schema name.

CellRange  (nvarchar(1024)): The cell range in the source.

Sheet  (nvarchar(1024)): The sheet name in the source.

FileType  (nvarchar(1024)): The type of the file.

ColumnDelimiter  (nvarchar(1)): The column delimiter in the source file.

RowDelimiter  (nvarchar(1)): The row delimiter in the source file.

QuoteCharacter  (nvarchar(1)): The quote character in the source file.

FirstRowHeader  (bit): Indicates if the first row is a header.

EscapeCharacter  (nvarchar(1)): The escape character in the source file.

CompressionType  (nvarchar(50)): The compression type.

LapageRuntime  (int): The lapage runtime for the pipeline in seconds.

noKey  (bit): Indicates if there is no key column.

deltaOverlap  (int): The delta overlap value.

deltaOverlapUnit  (nvarchar(50)): The unit for delta overlap.

PackageSize  (int): The size of the package for loading.

ArchivingScript  (nvarchar(max)): The generated SQL script for archiving data.
