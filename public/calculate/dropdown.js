var $ = jQuery
var CheckboxDropdown = function (el) {
  var _this = this;
  this.isOpen = false;
  this.areAllChecked = false;
  this.$el = $(el);
  this.$label = this.$el.find('.dropdown-label');
  this.$checkAll = this.$el.find('[data-toggle="check-all"]').first();
  this.$inputs = this.$el.find('[type="checkbox"]');

  // this.onCheckBox();

  this.$label.on('click', function (e) {
    e.preventDefault();
    _this.toggleOpen();
  });

  this.$checkAll.on('click', function (e) {
    e.preventDefault();
    _this.onCheckAll();
  });

  this.$inputs.on('change', function (e) {
    _this.onCheckBox();
  });
};

CheckboxDropdown.prototype.onCheckBox = function () {
  this.updateStatus();
  this.updateMinMax()
  this.uniqueItems()
};

CheckboxDropdown.prototype.uniqueItems = function () {
  var checked = Array.from(this.$el.parent().parent().find("input[name^=card-group]:checked"))
  Array.from(this.$el.parent().parent().find("input[name^=card-group]")).forEach(function (el) {
    if (!el.checked) {
      var l = checked.filter(_el => _el.value === el.value).length
      if (l >= window.options.find(c => c.id === parseInt(el.value)).val) {
        $(el).parent().parent().addClass("hide")
      } else {
        $(el).parent().parent().removeClass("hide")
      }
    }
  })
}

CheckboxDropdown.prototype.updateMinMax = function () {
  var min = this.$el.parent().find("[id^=min]").get(0)
  var max = this.$el.parent().find("[id^=max]").get(0)
  var ids = Array.from(this.$el.find(':checked')).map((el) => parseInt(el.value)) || [0]
  var totalcards = (window.options.filter(card => ids.indexOf(card.id) !== -1) || []).reduce((b, a) => a.val + b, 0)
  
  min.innerHTML = Array(totalcards+1).fill(0).map((_, i) => `<option value="${i}">${i}</option>`).join("")
  max.innerHTML = Array(totalcards+1).fill(0).map((_, i) => `<option value="${i}">${i}</option>`).join("")
}

CheckboxDropdown.prototype.updateStatus = function () {
  var checked = this.$el.find(':checked');

  this.areAllChecked = false;
  this.$checkAll.html('Check All');

  if (checked.length <= 0) {
    this.$label.html('Select card(s)');
  }
  else if (checked.length === this.$inputs.length) {
    this.$label.html('All Selected');
    this.areAllChecked = true;
    this.$checkAll.html('Uncheck All');
  }
  else {
    this.$label.html(checked.length + ' Selected');
  }
};

CheckboxDropdown.prototype.onCheckAll = function (checkAll) {
  if (!this.areAllChecked || checkAll) {
    this.areAllChecked = true;
    this.$checkAll.html('Uncheck All');
    this.$inputs.prop('checked', true).trigger('change');
  }
  else {
    this.areAllChecked = false;
    this.$checkAll.html('Check All');
    this.$inputs.prop('checked', false).trigger('change');
  }

  this.updateStatus();
};

CheckboxDropdown.prototype.toggleOpen = function (forceOpen) {
  var _this = this;

  if (!this.isOpen || forceOpen) {
    this.isOpen = true;
    this.$el.addClass('on');
    $(document).on('click', function (e) {
      if (!$(e.target).closest('[data-control]').length) {
        _this.toggleOpen();
      }
    });
  }
  else {
    this.isOpen = false;
    this.$el.removeClass('on');
    $(document).off('click');
  }
};
