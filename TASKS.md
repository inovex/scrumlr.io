# Todo List

* Refactor board actions (add correct typings)
* Integrate joining board confirmation process
    * Join directly (public board)
    * Join with passphrase
    * Join with required confirmation
    * (Join encrypted board) upon implementation of encryption/decryption
* Add template schema on server
    * Add (optional) template reference to boards
    * Add editable columns to board model
* Async update of board & column names (dirty states, compare to cards)
* Add local mockup data in redux store to proceed with development
* Implement retry mechanism on server calls (e.g. add or update card)
* Add editable / stackable options to Card model (active while not persisted)
* Display/hide options to edit/delete entities based on users permissions
* Add card text input field / edit option
    * Display loading indicator (while data is being persisted on the server)
* Enable card stacks
* Add sorting options of cards & stacks
* Add voting actions/reducers ...
* Add option to promote users to admins or revoke their access
* Integrate data encryption/decryption
    * Add crypto library
        * Generate public/private keypair
        * Store keypair in cloud (protected via passphrase)
    * Enforce public/private keypair in join board process
    * Encrypt/decrypt sensitive data
        * Board name
        * Card text
* Sync time between server & client, so that a timer will display correct
  values on the client
* Document code (TSdoc)
* Add unit tests

    
