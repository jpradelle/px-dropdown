// Extend Polymer.Element base class
class PxDropdownContent extends Polymer.Element {
  static get is() { return 'px-dropdown-content'; }
  static get config() {
    return {
      properties: {
        /**
         * Array that contains the list of items which show up in the dropdown.
         * Each item is an object, where the 'key' should be a unique identifier,
         * the 'val' attribute reflects the text that is displayed, and
         * the 'checked' attribute reflects the state of the checkbox
         * (if px-dropdown-content has checkbox-mode="true").
         */
        items: {
          type: Array,
          notify: true,
          value: function () { return []; }
        },
        /**
         * This property stores the items array, after it's been
         * changed over to be an array of objects.
         */
        computedItems: {
          type: Array,
          value: function () { return []; },
          computed: '_computedItems(items, items.*)'
        },
        /**
         * A read-only property that tells you if the user has selected anything from the dropdown.
         */
        selectionOccured: {
          type: Boolean,
          value: false,
          readOnly: true
        },
        /**
         * Used to check if the dropdown is currently open or closed.
         */
        menuOpen: {
          type: Boolean,
          notify: true,
          // value: false
          value: true
        },
        /**
         * Maximum number of characters in a container.
         * Will be used to calculate whether the dropdown will have a tooltip and ellipsis.
         * Optional.
         */
        maxContCharacterWidth: {
          type: Number,
          value: 0,
          observer: '_maxContCharacterWidthChanged'
        },
        /**
         * An optional attribute which specifies if the dropdown should extend in width
         * beyond the cell it's dropping from.
         */
        extendDropdown: {
          type: Boolean,
          value: false,
        },
        /**
         * An optional attribute which specifies how many pixels the dropdown
         * should extend beyond the cell it's dropping from.
         */
        extendDropdownBy: {
          type: Number,
          value: 15,
        },
        /**
         * An attribute which specifies whether the dropdown is
         * extended in width from its container.
         */
        extended: {
          type: Boolean,
          value: false
        },
        /**
         * Width of the dropCell.
         */
        dropCellWidth: {
          type: Number,
          value: 0,
          observer: '_dropCellWidthChanged'
        },
        /**
         * Height of the dropCell.
         */
        dropCellHeight: {
          type: Number,
          value: 0,
          observer: '_dropCellHeightChanged'
        },
        /**
         * By default, the dropdown will constrain scrolling on the page
         * when opened AND the dropdown has a scrollbar.
         * Set to true in order to prevent the page from scrolling while the dropdown is open and has a scrollbar of its own.
         */
        allowOutsideScroll: {
          type: Boolean,
          value: false
        },
        /**
         * If set to true, each dropdown item will have a checkbox and clicking an
         * item will toggle the checkbox state rather than selecting the item.
         * The checkbox state will be reflected in the 'items' array.
         * An event is fired when an item is checked or unchecked.
         */
        checkboxMode: {
          type: Boolean,
          value: false
        }
      }
    }
  }
  constructor() {
    super();
  }
  connectedCallback() {
    super.connectedCallback();
  }
  
  _maxContCharacterWidthChanged(newValue) {
      if(newValue) {
        this.dispatchEvent(new CustomEvent('px-dropdown-max-width', {bubbles: true, composed: true, detail: {maxContCharacterWidth : this.maxContCharacterWidth}}));
      }
    }
    /**
     * Opens the dropdown menu.
     */
    open() {


      this.menuOpen = true;

      //lock scroll outside if needed
      if(!this.allowOutsideScroll) {

        //only if we have scroll bar
        var currentHeight = parseInt(this.shadowRoot.querySelector('#dropdown').getBoundingClientRect().height);

        //do we have a scrollbar?
        if(currentHeight < this.shadowRoot.querySelector('#dropdown').scrollHeight) {
          Polymer.IronDropdownScrollManager.pushScrollLock(this.shadowRoot.querySelector('#dropdown'));
        }
      }

      //resize ourselves
      this.dispatchEvent(new CustomEvent('px-event', {bubbles: true, composed: true, detail: {pxContent: this}}));
    }
    _dropCellWidthChanged(newValue, oldValue) {
      if(newValue) {
        this._setWidth();
      }
    }
    _dropCellHeightChanged(newValue, oldValue) {
      if(newValue) {
        this.adjustHeight();
      }
    }
    _checkChanged(evt) {
      var checkbox = evt.target;
      this._checkboxChanged(checkbox);
    }
    _checkboxChanged(checkbox) {
      this.items.forEach(function(item, index) {
        if(item.key === checkbox.dataKey) {
          this.set('items.' + index + '.checked', checkbox.checked);
        }
      }.bind(this));
      /**
       * Event fired when any given element is selected or deselected in checkboxMode.
       * `evt.detail` contains:
       * ```
       * { val: "text of the changed element",
       *   key: "key of the changed element",
       *   checked: true/false,
       *   items: [the updated items array] }
       * ```
       * @event px-dropdown-checkbox-changed
       */
      this.dispatchEvent(new CustomEvent('px-dropdown-checkbox-changed', {bubbles: true, composed: true, detail:{
        val: checkbox.parentNode.textContent,
        key: checkbox.dataKey,
        checked: checkbox.checked,
        items: this.items
      }}));
    }
    /**
     * Closes the dropdown menu.
     */
    close() {
      this.menuOpen = false;
      Polymer.IronDropdownScrollManager.removeScrollLock(this.shadowRoot.querySelector('#dropdown'));
    }
    /**
     * Size the content to height to fit maxHeight and do the height adjustments
     * for scrolling.
     */
    sizeHeight(maxHeight) {
      console.log(maxHeight)
      var currentHeight = parseInt(this.shadowRoot.querySelector('#dropdown').getBoundingClientRect().height);

      //limit height
      if(currentHeight > maxHeight) {
        this.shadowRoot.querySelector('#dropdown').style.height = maxHeight + 'px';
      }
      else {
        this.adjustHeight();
      }
    }
    /**
     * Reset the height of the content.
     */
    resetHeight() {
      this.shadowRoot.querySelector('#dropdown').style.height = '';
    }
    /**
     * Checks if the length of the value in the dropdown list is longer than
     * the allowed Max length, passed in as maxContCharacterWidth.
     * If it is, px-tooltip is included with the component.
     */
    _includeTooltip(value) {
      //find the container max character passed in
      var maxContWidth = this.maxContCharacterWidth;
      if(value === null || value === undefined || typeof value === 'string' && value.trim().length === 0) {
        return false;
      }
      //find out if the character count in the passed value is higher than the allowed max. if it is, we show the tooltip.
      return (maxContWidth !== undefined && maxContWidth !== null && maxContWidth !== 0) ? (value.length > maxContWidth) : false;
    }
    /**
     * This function is called on an item click, and calls the fire event
     * as well as closes the dropdown. Finally, it flips the opened flag.
     */
    _clickItem(evt) {
      /**
       * Event fired when an element is clicked  on in the dropdown.
       * @event px-dropdown-click
       */
      var event = evt;
          event.bubbles = true; 
          event.composed = true; 
      this.dispatchEvent(event);

      if(this.checkboxMode) {

        //try to toggle checkbox state
        var checkbox = evt.target.querySelector('input');

        //if we haven't found it it's probably because the click was actually
        //on the checkbox so just ignore
        if(checkbox) {
          checkbox.checked = !checkbox.checked;
          this._checkboxChanged(checkbox);
        }
      }
      else {

        this.close();
        this.dispatchEvent(new CustomEvent('px-dropdown-flip', {bubbles: true, composed: true}));
        this._setSelectionOccured(true);
        /**
         * Event fired when a single element is selected if NOT in checkboxMode.
         * `evt.detail` contains:
         * ```
         * { val: "text of the selected element",
         *   key: "key of the selected element" }
         * ```
         * @event px-dropdown-value-changed
         */
        this.dispatchEvent(new CustomEvent('px-dropdown-value-changed', {bubbles: true, composed: true, detail: 
          {val: this.computedItems[evt.target.value].val,
            key: this.computedItems[evt.target.value].key}  
        }));
        
      }
    }
    /**
     * Sets the dropdown width depending on the dropcell width and the extendDropdownBy.
     */
    _setWidth() {
      if (this.extendDropdown) {
        this.shadowRoot.querySelector('#dropdown').style.width = this.dropCellWidth + parseInt(this.extendDropdownBy) + 'px';
      }
      else {
        this.shadowRoot.querySelector('#dropdown').style.width = this.dropCellWidth + 'px';
      }
    }
    /**
     * Allows for the dropdown height to be adjusted by reducing it by half
     * an item's height if the dropdown has scrollbars so it's more obvious the user
     * can scroll.
     */
    adjustHeight() {
      var currentHeight = parseInt(this.shadowRoot.querySelector('#dropdown').getBoundingClientRect().height);

      //do we have a scrollbar?
      if(currentHeight < this.shadowRoot.querySelector('#dropdown').scrollHeight) {

        //reduce height by half the size of an item
        var reduceBy = parseInt(this.dropCellHeight/2);
        this.shadowRoot.querySelector('#dropdown').style.height = currentHeight - reduceBy + 'px';
      }
    }
    /**
     * This function finds out whether the passed items array is
     * an array of objects, or an array of strings. if it is strings
     * they are converted to objects.
     */
    _computedItems(items) {
      if(this.items){
        var computedItemsArr = [];
        if (typeof this.items[0] === 'string') {
          var len = items.length,
          i = 0;

          for (i; i < len; i++) {
            if(this.checkboxMode) {
              //default unchecked if using a string array in check mode
              computedItemsArr.push({val:items[i], checked: false});
            }
            else {
              computedItemsArr.push({val:items[i]});
            }
          }
          return computedItemsArr;
        }
        else {
          //with new array it looks like we need to do a copy of items
          // seems like items can be sparse at this point
          items.forEach(function(item, index) {
            computedItemsArr.push(item);
          });
          return computedItemsArr;
        }
      }
    }
}

// Register custom element definition using standard platform API
customElements.define(PxDropdownContent.is, PxDropdownContent);