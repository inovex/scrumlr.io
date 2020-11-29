# Todo List

* ~~Refactor board actions (add correct typings)~~
* ~~Rename card to note (due to Chrome behaviour that tries to fill input fields with the placeholder '...card...' with
  credit card information)~~
* ~~Add editable columns to board model~~
* ~~Async update of board & column names (dirty states, compare to notes)~~
* Check impact of newObjectId in https://github.com/parse-community/parse-server/blob/master/src/cryptoUtils.js
    * Replace ID generating mechanism
* Add local mockup data in redux store to proceed with development
* Delete notes & votes when column gets deleted
* Create board with options
* Integrate joining board confirmation process
    * ~~Join directly (public board)~~
    * Join with required confirmation
    * Join with passphrase
    * (Join encrypted board) upon implementation of encryption/decryption
* Add template schema on server
    * Add (optional?) template reference to boards
    * Copy structure of template into board
* Implement retry mechanism on server calls (e.g. add or update note)
* Add editable / stackable options to Note model (active while not persisted)
* Display/hide options to edit/delete entities based on users permissions
* Add note text input field / edit option
    * Display loading indicator (while data is being persisted on the server)
* Enable note stacks
* Add sorting options of notes & stacks
* Add voting actions/reducers ...
* Add option to promote users to admins or revoke their access
* Integrate data encryption/decryption
    * Add crypto library
        * Generate public/private keypair
        * Store keypair in cloud (protected via passphrase)
    * Enforce public/private keypair in join board process
    * Encrypt/decrypt sensitive data
        * Board name
        * Note text
* Sync time between server & client, so that a timer will display correct
  values on the client
* Document code (TSdoc)
* Add unit tests

    
