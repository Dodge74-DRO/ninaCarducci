(function ($) {
  $.fn.mauGallery = function (options) {
    options = $.extend($.fn.mauGallery.defaults, options);
    let tagsCollection = [];
    return this.each(function () {
      const $this = $(this);
      const methods = $.fn.mauGallery.methods;

      methods.createRowWrapper($this);

      if (options.lightBox) {
        methods.createLightBox($this, options.lightboxId, options.navigation);
      }

      $.fn.mauGallery.listeners(options);

      $this.children(".gallery-item").each(function () {
        const $item = $(this);
        methods.responsiveImageItem($item);
        methods.moveItemInRowWrapper($item);
        methods.wrapItemInColumn($item, options.columns);
        const theTag = $item.data("gallery-tag");

        if (options.showTags && theTag && !tagsCollection.includes(theTag)) {
          tagsCollection.push(theTag);
        }
      });

      if (options.showTags) {
        methods.showItemTags($this, options.tagsPosition, tagsCollection);
      }

      $this.fadeIn(500);
    });
  };

  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };

  $.fn.mauGallery.listeners = function (options) {
    $(".gallery-item").on("click", function () {
      if (options.lightBox && $(this).is("IMG")) {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      }
    });

    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    $(".gallery").on("click", ".mg-prev", () => $.fn.mauGallery.methods.prevImage(options.lightboxId));
    $(".gallery").on("click", ".mg-next", () => $.fn.mauGallery.methods.nextImage(options.lightboxId));
  };

  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (!element.children().first().hasClass("row")) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },

    wrapItemInColumn(element, columns) {
      let columnClasses = "";

      if (typeof columns === "number") {
        columnClasses = `col-${Math.ceil(12 / columns)}`;
      } else if (typeof columns === "object") {
        if (columns.xs) columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        if (columns.sm) columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        if (columns.md) columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        if (columns.lg) columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        if (columns.xl) columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
      } else {
        console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
        return;
      }

      element.wrap(`<div class='item-column mb-4 ${columnClasses}'></div>`);
    },

    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },

    responsiveImageItem(element) {
      if (element.is("IMG")) {
        element.addClass("img-fluid");
      }
    },

    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`).find(".lightboxImage").attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },

    changeImage(lightboxId, getNextIndex) {
      const activeImageSrc = $(".lightboxImage").attr("src");
      const activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      const imagesCollection = [];

      $(".item-column img").each(function () {
        if (activeTag === "all" || $(this).data("gallery-tag") === activeTag) {
          imagesCollection.push($(this));
        }
      });

      const activeIndex = imagesCollection.findIndex(img => img.attr("src") === activeImageSrc);
      const nextIndex = getNextIndex(activeIndex, imagesCollection.length);
      const nextImage = imagesCollection[nextIndex] || imagesCollection[0];

      $(".lightboxImage").attr("src", nextImage.attr("src"));
    },

    prevImage(lightboxId) {
      this.changeImage(lightboxId, (currentIndex, length) => (currentIndex - 1 + length) % length);
    },

    nextImage(lightboxId) {
      this.changeImage(lightboxId, (currentIndex, length) => (currentIndex + 1) % length);
    },

    createLightBox(gallery, lightboxId = "galleryLightbox", navigation) {
      const navPrev = navigation ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>' : '';
      const navNext = navigation ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">></div>' : '';
      gallery.append(`
        <div class="modal fade" id="${lightboxId}" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-body">
                ${navPrev}
                <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                ${navNext}
              </div>
            </div>
          </div>
        </div>`);
    },

    showItemTags(gallery, position, tags) {
      const tagItems = tags.map(tag => `<li class="nav-item active"><span class="nav-link" data-images-toggle="${tag}">${tag}</span></li>`).join('');
      const tagsRow = `<ul class="my-4 tags-bar nav nav-pills"><li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },

    filterByTag() {
      if ($(this).hasClass("active-tag")) return;

      $(".active.active-tag").removeClass("active active-tag");
      $(this).addClass("active-tag active");

      const tag = $(this).data("images-toggle");

      $(".gallery-item").each(function () {
        const $column = $(this).parents(".item-column");
        $column.hide();
        if (tag === "all" || $(this).data("gallery-tag") === tag) {
          $column.show(300);
        }
      });
    }
  };
})(jQuery);