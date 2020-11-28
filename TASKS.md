# Todo List

* Refactor board actions (add correct typings)
* Integrate joining board confirmation process
    * Join directly (public board)
    * Join with passphrase
    * Join with required confirmation
    * Join encrypted board
* Integrate data encryption/decryption
    * Add crypto library
        * Generate public/private keypair
        * Store keypair in cloud (protected via passphrase)
    * Enforce public/private keypair in join board process
    * Encrypt/decrypt sensitive data
        * Board name
        * Card text
* Async update of board name (dirty states, compare to cards)
* Add voting actions/reducers ...
* Add editable / stackable options to Card model (active while not persisted)
* Display/hide options to edit/delete entities based on users permissions
* Add card text input field / edit option
    * Display loading indicator (while data is being persisted on the server)
* Enable card stacks
* Add sorting options of cards & stacks
* Sync time between server & client, so that a timer will display correct
  values on the client
* Document code (TSdoc)
* Add unit tests

    
