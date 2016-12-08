// Extend Polymer.Element base class
class PxDropdownChevron extends Polymer.Element {
  static get is() { return 'px-dropdown-chevron'; }
  static get config() {
    return {
      properties: {
        /**
       * Boolean which reflects whether the chevron is being hovered over.
       *
       * @prop hover
       * @type Boolean
       * @default false
       * @notify true
       */
        hover: {
          type: Boolean,
          value: false,
          notify: true
        },
        /**
         * Boolean which reflects whether the menu is open.
         *
         * @prop opened
         * @type Boolean
         * @default false
         * @notify true
         */
        opened: {
          type: Boolean,
          value: false,
          notify: true
        }
      }
    }
  }
  constructor() {
    super();
    this.addEventListener('hoverOff',this._manipulateHoverOff.bind(this));
    this.addEventListener('hoverOn',this._manipulateHoverOn.bind(this));
    this.addEventListener('opened',this._manipulateOpened.bind(this));

  }
  connectedCallback() {
    super.connectedCallback();
  }
  /**
   * this function flips the opened flag, and changes the class for the component
   *
   *
   * @method _manipulateOpened
   */
  _manipulateOpened(evt) {
    evt.stopPropagation();
    this.opened = !this.opened;
  }
  /**
   * this function sets the hover flag to false, and changes the class for the component
   *
   * @method _manipulateHoverOff
   */
  _manipulateHoverOff(evt) {
    evt.stopPropagation();
    this.hover = false;
  }
  /**
   * this function sets the hover flag to true, and changes the class for the component
   *
   * @method _manipulateHoverOn
   */
  _manipulateHoverOn(evt) {
    evt.stopPropagation();
    this.hover = true;
  }
  /**
   * This method add either the opened or hover class.
   *
   * @method _chevronClass
   */
  _chevronClass() {
    if (this.opened) {
      return "opened";
    } else if (this.hover) {
      return "hover";
    }
  }
}

// Register custom element definition using standard platform API
customElements.define(PxDropdownChevron.is, PxDropdownChevron);